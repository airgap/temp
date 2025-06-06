import { createRedisClient } from '@lyku/redis-client';
import { createLogger } from '@lyku/logger';
import { client as pg } from '@lyku/postgres-client';
import { client as redis } from '@lyku/redis-client';
import { createMetricsClient } from '@lyku/metrics';
import { initializeQueueSystem, RetryQueue } from '@lyku/queue-system';
import {
	ReactionPersistenceProcessor,
	RedisRecoveryService,
} from './recovery-systems';
import { Kysely, sql } from 'kysely';
import type { Database } from '@lyku/db-types';
import { reconcileRedisWithPostgres } from './reconcileRedisWithPostgres';

/**
 * Reaction Worker Service
 *
 * This service runs as a dedicated worker to process retry queues
 * and handle reconciliation between Redis and PostgreSQL.
 */
export class ReactionWorkerService {
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
			name: this.config.serviceName,
		});

		this.logger.info('Initializing reaction worker service', {
			config: this.config,
		});

		// Initialize database connection
		this.db = pg;

		// Initialize Redis client with configuration for high availability
		this.redis = redis;

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

		// Stop HTTP health check server if it exists
		if (this.healthServer) {
			try {
				await this.healthServer.stop();
				this.logger.info('Stopped health check HTTP server');
			} catch (error) {
				this.logger.error('Error stopping health check server', { error });
			}
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

			// Run reconciliation
			await reconcileRedisWithPostgres(1000, this.logger);

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
			await this.db.selectFrom('reactions').limit(1).execute();
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
	private healthServer: { stop: () => Promise<void> } | null = null;

	private async registerK8sHealthCheck(): Promise<void> {
		try {
			// Dynamically import the HTTP server to avoid dependency cycles
			const { startHealthCheckServer } = await import('./http-server');

			// Start HTTP server on port 8080 or from environment variable
			const httpPort = parseInt(process.env.HEALTH_CHECK_PORT || '8080', 10);
			this.healthServer = startHealthCheckServer(httpPort, this);

			this.logger.info(
				`Kubernetes health check server started on port ${httpPort}`,
			);
		} catch (error) {
			this.logger.error('Failed to start health check server', { error });
		}
	}
}
