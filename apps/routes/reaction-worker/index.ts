import { createRedisClient } from '@lyku/redis-client';
import { createLogger } from '@lyku/logger';
import { initDb } from '@lyku/postgres-client';
import { createMetricsClient } from '@lyku/metrics';
import { initializeQueueSystem, RetryQueue } from '@lyku/queue-system';
import {
	ReactionPersistenceProcessor,
	RedisRecoveryService,
} from './recovery-systems';
import { Kysely } from 'kysely';
import { Database } from '@lyku/db-config/kysely';

/**
 * Reaction Worker Service
 *
 * This service runs as a dedicated worker to process retry queues
 * and handle reconciliation between Redis and PostgreSQL.
 */
class ReactionWorkerService {
	private db: Kysely<Database>;
	private redis: any;
	private metrics: any;
	private logger: any;
	private queueSystem: Record<string, RetryQueue>;
	private recoveryService: RedisRecoveryService | null = null;
	private isShuttingDown = false;
	private reconcileInterval: NodeJS.Timeout | null = null;
	private healthCheckInterval: NodeJS.Timeout | null = null;

	constructor(
		private config: {
			serviceName: string;
			environment: string;
			redisUrl: string;
			postgresUrl: string;
			enableRecovery: boolean;
			enableMonitoring: boolean;
			reconcileIntervalMs: number;
			healthCheckIntervalMs: number;
			k8sEnabled: boolean;
		},
	) {}

	/**
	 * Initialize the worker service
	 */
	async initialize(): Promise<void> {
		// Initialize logger
		this.logger = createLogger({
			level: this.config.environment === 'production' ? 'info' : 'debug',
			serviceName: this.config.serviceName,
		});

		this.logger.info('Initializing reaction worker service', {
			config: this.config,
		});

		// Initialize database connection
		this.db = initDb();

		// Initialize Redis client with configuration for high availability
		this.redis = createRedisClient({
			url: this.config.redisUrl,
			cluster: true,
			commandTimeout: 5000,
			retryStrategy: (times) => Math.min(times * 50, 2000),
			enableKeyspaceEvents: true,
			tls: this.config.environment === 'production',
		});

		// Initialize metrics client
		this.metrics = createMetricsClient(
			{
				serviceName: this.config.serviceName,
				environment: this.config.environment,
				defaultLabels: {
					service: this.config.serviceName,
					environment: this.config.environment,
					component: 'worker',
				},
				logMetrics: this.config.environment !== 'production',
			},
			this.logger,
		);

		// Initialize queue system
		this.queueSystem = initializeQueueSystem(this.redis, this.logger, {
			'redis:persistence:retry': {
				baseRetryDelayMs: 5000, // Start with 5 second delay
				maxRetryDelayMs: 300000, // Max 5 minute delay
				defaultMaxAttempts: 10, // Try up to 10 times
				batchSize: 100, // Process 100 jobs at once
				// Don't auto-start, we'll start it manually
				autoStart: false,
			},
		});

		// Register processors for the retry queues
		const persistenceProcessor = new ReactionPersistenceProcessor(
			this.db,
			this.metrics,
			this.logger,
		);
		(
			this.queueSystem['redis:persistence:retry'] as RetryQueue
		).registerProcessor('persistReactionToPostgres', persistenceProcessor);

		// Initialize recovery service if enabled
		if (this.config.enableRecovery) {
			this.recoveryService = new RedisRecoveryService(
				this.db,
				this.redis,
				this.metrics,
				this.logger,
			);
			this.logger.info('Redis recovery service initialized');
		}

		// Register Kubernetes health checks if enabled
		if (this.config.k8sEnabled) {
			this.registerK8sHealthCheck();
		}

		this.logger.info('Reaction worker service initialized successfully');
	}

	/**
	 * Start the worker service
	 */
	async start(): Promise<void> {
		this.logger.info('Starting reaction worker service');

		// Start queue processing
		for (const [queueName, queue] of Object.entries(this.queueSystem)) {
			queue.start();
			this.logger.info(`Started queue processing for ${queueName}`);
		}

		// Start periodic reconciliation job
		if (this.config.reconcileIntervalMs > 0) {
			this.logger.info(
				`Starting reconciliation job with interval ${this.config.reconcileIntervalMs}ms`,
			);
			this.reconcileInterval = setInterval(
				() => this.runReconciliation(),
				this.config.reconcileIntervalMs,
			);
		}

		// Start health check job
		if (this.config.healthCheckIntervalMs > 0) {
			this.logger.info(
				`Starting health check job with interval ${this.config.healthCheckIntervalMs}ms`,
			);
			this.healthCheckInterval = setInterval(
				() => this.performHealthCheck(),
				this.config.healthCheckIntervalMs,
			);
		}

		this.logger.info('Reaction worker service started successfully');
	}

	/**
	 * Stop the worker service
	 */
	async stop(): Promise<void> {
		if (this.isShuttingDown) {
			return;
		}

		this.isShuttingDown = true;
		this.logger.info('Stopping reaction worker service');

		// Stop reconciliation job
		if (this.reconcileInterval) {
			clearInterval(this.reconcileInterval);
			this.reconcileInterval = null;
		}

		// Stop health check job
		if (this.healthCheckInterval) {
			clearInterval(this.healthCheckInterval);
			this.healthCheckInterval = null;
		}

		// Stop queue processing
		for (const [queueName, queue] of Object.entries(this.queueSystem)) {
			queue.stop();
			this.logger.info(`Stopped queue processing for ${queueName}`);
		}

		// Close connections
		try {
			await this.redis.quit();
			await this.db.destroy();
			this.logger.info('Closed database and Redis connections');
		} catch (error) {
			this.logger.error('Error closing connections', { error });
		}

		this.logger.info('Reaction worker service stopped successfully');
	}

	/**
	 * Run reconciliation job
	 */
	private async runReconciliation(): Promise<void> {
		if (this.isShuttingDown) {
			return;
		}

		try {
			this.logger.info('Starting reconciliation job');
			const startTime = Date.now();

			// Import the reconcile function from the handler
			const { reconcileRedisWithPostgres } = await import('./reaction-handler');

			// Run reconciliation
			await reconcileRedisWithPostgres(this.db, this.redis, 1000, this.logger);

			const duration = Date.now() - startTime;
			this.metrics.recordHistogram('reconciliation_duration_ms', duration);
			this.logger.info('Reconciliation job completed', {
				durationMs: duration,
			});
		} catch (error) {
			this.metrics.incrementCounter('reconciliation_failures');
			this.logger.error('Reconciliation job failed', { error });
		}
	}

	/**
	 * Perform health check
	 */
	private async performHealthCheck(): Promise<void> {
		if (this.isShuttingDown) {
			return;
		}

		try {
			this.logger.debug('Performing health check');

			// Check Redis
			const redisStartTime = Date.now();
			await this.redis.ping();
			const redisLatency = Date.now() - redisStartTime;
			this.metrics.recordGauge('redis_ping_latency_ms', redisLatency);

			// Check Database
			const dbStartTime = Date.now();
			await this.db
				.selectFrom('reactions')
				.select(sql`1`)
				.limit(1)
				.execute();
			const dbLatency = Date.now() - dbStartTime;
			this.metrics.recordGauge('db_ping_latency_ms', dbLatency);

			// Check queue statistics
			const pendingJobs = await this.countPendingJobs();
			this.metrics.recordGauge('pending_retry_jobs', pendingJobs);

			this.logger.debug('Health check completed', {
				redisLatencyMs: redisLatency,
				dbLatencyMs: dbLatency,
				pendingJobs,
			});
		} catch (error) {
			this.metrics.incrementCounter('health_check_failures');
			this.logger.error('Health check failed', { error });
		}
	}

	/**
	 * Count pending jobs in retry queues
	 */
	private async countPendingJobs(): Promise<number> {
		const queueKey = 'queue:redis:persistence:retry:jobs';
		const now = Date.now();

		const pendingJobs = await this.redis.zcount(queueKey, '0', now.toString());
		const futureJobs = await this.redis.zcount(
			queueKey,
			now.toString(),
			'+inf',
		);

		this.metrics.recordGauge('pending_retry_jobs_now', pendingJobs);
		this.metrics.recordGauge('pending_retry_jobs_future', futureJobs);

		return pendingJobs + futureJobs;
	}

	/**
	 * Register Kubernetes health check endpoints
	 */
	private registerK8sHealthCheck(): void {
		// This would typically be done via an HTTP server
		// For simplicity, we're just logging that it would be registered
		this.logger.info('Kubernetes health checks would be registered here');

		// In a real implementation, you would:
		// 1. Create an Express/Fastify/Koa HTTP server
		// 2. Add /health, /readiness, and /liveness endpoints
		// 3. Return status based on Redis and DB connectivity
	}
}

/**
 * Main function to start the worker service
 */
async function main() {
	// Read configuration from environment variables
	const config = {
		serviceName: process.env.SERVICE_NAME || 'reaction-worker',
		environment: process.env.NODE_ENV || 'development',
		redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
		postgresUrl: process.env.POSTGRES_URL || 'postgres://localhost:5432/lyku',
		enableRecovery: process.env.ENABLE_RECOVERY === 'true',
		enableMonitoring: process.env.ENABLE_MONITORING !== 'false',
		reconcileIntervalMs: parseInt(
			process.env.RECONCILE_INTERVAL_MS || '300000',
			10,
		), // 5 minutes
		healthCheckIntervalMs: parseInt(
			process.env.HEALTH_CHECK_INTERVAL_MS || '60000',
			10,
		), // 1 minute
		k8sEnabled: process.env.K8S_ENABLED === 'true',
	};

	// Create and start worker service
	const workerService = new ReactionWorkerService(config);

	// Handle graceful shutdown
	const handleShutdown = async () => {
		console.log('Received shutdown signal');
		await workerService.stop();
		process.exit(0);
	};

	process.on('SIGTERM', handleShutdown);
	process.on('SIGINT', handleShutdown);

	try {
		await workerService.initialize();
		await workerService.start();
	} catch (error) {
		console.error('Failed to start worker service', error);
		process.exit(1);
	}
}

// Start the service
if (require.main === module) {
	main().catch(console.error);
}

export { ReactionWorkerService };
