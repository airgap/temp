// import brotworst from 'compress-brotli';
// import { compress, decompress } from '@mongodb-js/zstd';
// import { zstdCompressSync as compress } from 'node:zlib';
import { client as es } from '@lyku/elasticsearch-client';
import { createLogger } from '@lyku/logger';
import { client as pg } from '@lyku/postgres-client';
import { client as redis } from '@lyku/redis-client';
import { createMetricsClient } from '@lyku/metrics';
import { delasticatePost } from './delasticatePost';
import { Kysely } from 'kysely';
import type { Database } from '@lyku/db-types';
import { buildHotQuery } from './buildHotQuery';
import { stringifyBON } from 'from-schema';

// const compressor = brotworst();

export type HotPostAggregationServiceConfig = {
	serviceName: string;
	environment: string;
	redisUrl: string;
	postgresUrl: string;
	enableRecovery: boolean;
	enableMonitoring: boolean;
	aggregationIntervalMs: number;
	healthCheckIntervalMs: number;
	k8sEnabled: boolean;
};

/**
 * Aggie
 *
 * This service runs as a dedicated worker to aggregate hot posts
 * from Elasticsearch into Redis
 */
export class HotPostAggregationService {
	private pg?: Kysely<Database>;
	private redis: any;
	private metrics: any;
	private logger: any;
	private isShuttingDown = false;
	private aggregationInterval: NodeJS.Timeout | null = null;
	private healthCheckInterval: NodeJS.Timeout | null = null;

	constructor(private config: HotPostAggregationServiceConfig) {}

	/**
	 * Initialize the worker service
	 */
	async initialize(): Promise<void> {
		console.log('Initializing Aggie');
		// Initialize logger
		this.logger = createLogger({
			level: this.config.environment === 'production' ? 'info' : 'debug',
			name: this.config.serviceName,
		});

		this.logger.info('Initializing Aggie', {
			config: this.config,
		});

		// Initialize database connection
		this.pg = pg;

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

		// Register Kubernetes health checks if enabled
		if (this.config.k8sEnabled) {
			this.registerK8sHealthCheck();
		}

		this.logger.info('Aggie initialized successfully');
	}

	/**
	 * Start the worker service
	 */
	async start(): Promise<void> {
		this.logger.info('Starting Aggie');

		// Start periodic aggregation job
		if (this.config.aggregationIntervalMs > 0) {
			this.logger.info(
				`Starting hot post aggregation job with interval ${this.config.aggregationIntervalMs}ms`,
			);
			this.runAggregation();
			this.aggregationInterval = setInterval(
				() => this.runAggregation(),
				this.config.aggregationIntervalMs,
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

		this.logger.info('Aggie started successfully');
	}

	/**
	 * Stop the worker service
	 */
	async stop(): Promise<void> {
		if (this.isShuttingDown) {
			return;
		}

		this.isShuttingDown = true;
		this.logger.info('Stopping Aggie');

		// Stop aggregation job
		if (this.aggregationInterval) {
			clearInterval(this.aggregationInterval);
			this.aggregationInterval = null;
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

		// Close connections
		try {
			await this.redis.quit();
			await this.pg?.destroy();
			this.logger.info('Closed database and Redis connections');
		} catch (error) {
			this.logger.error('Error closing connections', { error });
		}

		this.logger.info('Aggie stopped successfully');
	}

	/**
	 * Run aggregation job
	 */
	private async runAggregation(): Promise<void> {
		if (this.isShuttingDown) {
			return;
		}

		try {
			this.logger.info('Starting hot post aggregation job');
			const startTime = Date.now();

			const query = buildHotQuery({ dateRange: 'year', size: 500 });
			console.log('Querying elasticsearch');
			const result = await es.search(query);
			// console.log('Elasticsearch query result:', result);
			const hits = result.hits.hits?.map(delasticatePost);
			console.log('Stringifying', hits?.length);
			const stringified = stringifyBON(hits);
			// console.log('Compressing');
			// const compressed = await compress(Buffer.from(stringified));
			console.log('Caching');
			const posted = await redis.set('hot_posts', stringified);
			await redis.set('hot_posts_ts', Date.now());
			console.log('posted', posted);

			const duration = Date.now() - startTime;
			this.metrics.recordHistogram('aggie_duration_ms', duration);
			this.logger.info('Hot post aggregation job completed', {
				durationMs: duration,
			});
		} catch (error) {
			this.metrics.incrementCounter('aggie_failures');
			this.logger.error('Hot post aggregation job failed', { error });
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
			await this.pg?.selectFrom('posts').limit(1).execute();
			const dbLatency = Date.now() - dbStartTime;
			this.metrics.recordGauge('db_ping_latency_ms', dbLatency);

			this.logger.debug('Health check completed', {
				redisLatencyMs: redisLatency,
				dbLatencyMs: dbLatency,
			});
		} catch (error) {
			this.metrics.incrementCounter('health_check_failures');
			this.logger.error('Health check failed', { error });
		}
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
