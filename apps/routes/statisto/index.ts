import { createLogger } from '@lyku/logger';
import { client as redis } from '@lyku/redis-client';
import { createMetricsClient } from '@lyku/metrics';
import { pack } from 'msgpackr';
import fetch from 'node-fetch';

export type RouteMetricsAggregationServiceConfig = {
	serviceName: string;
	environment: string;
	redisUrl: string;
	prometheusUrl: string;
	enableMonitoring: boolean;
	aggregationIntervalMs: number;
	healthCheckIntervalMs: number;
	k8sEnabled: boolean;
};

interface RouteMetrics {
	service: string;
	status: 'up' | 'down';
	requestRate: number;
	errorRate: number;
	responseTime: number;
	memoryUsage: number;
	inFlightRequests: number;
	lastUpdated: number;
}

/**
 * Statisto - Route Metrics Aggregation Service
 *
 * This service queries Prometheus/Grafana for API route metrics
 * and stores them in Redis for quick access
 */
export class RouteMetricsAggregationService {
	private redis: any;
	private metrics: any;
	private logger: any;
	private isShuttingDown = false;
	private aggregationInterval: NodeJS.Timeout | null = null;
	private healthCheckInterval: NodeJS.Timeout | null = null;

	constructor(private config: RouteMetricsAggregationServiceConfig) {}

	/**
	 * Initialize the worker service
	 */
	async initialize(): Promise<void> {
		console.log('Initializing Statisto');
		// Initialize logger
		this.logger = createLogger({
			level: this.config.environment === 'production' ? 'info' : 'debug',
			name: this.config.serviceName,
		});

		this.logger.info('Initializing Statisto', {
			config: this.config,
		});

		// Initialize Redis client
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

		this.logger.info('Statisto initialized successfully');
	}

	/**
	 * Start the worker service
	 */
	async start(): Promise<void> {
		this.logger.info('Starting Statisto');

		// Start periodic aggregation job
		if (this.config.aggregationIntervalMs > 0) {
			this.logger.info(
				`Starting route metrics aggregation job with interval ${this.config.aggregationIntervalMs}ms`,
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

		this.logger.info('Statisto started successfully');
	}

	/**
	 * Stop the worker service
	 */
	async stop(): Promise<void> {
		if (this.isShuttingDown) {
			return;
		}

		this.isShuttingDown = true;
		this.logger.info('Stopping Statisto');

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
			this.logger.info('Closed Redis connection');
		} catch (error) {
			this.logger.error('Error closing connections', { error });
		}

		this.logger.info('Statisto stopped successfully');
	}

	/**
	 * Query Prometheus for a specific metric
	 */
	private async queryPrometheus(query: string): Promise<any> {
		const encodedQuery = encodeURIComponent(query);
		// Use Prometheus directly in the cluster, no authentication needed
		const prometheusUrl =
			this.config.prometheusUrl ||
			'http://kube-prometheus-stack-prometheus.kube-prometheus-stack.svc.cluster.local:9090';
		const url = `${prometheusUrl}/api/v1/query?query=${encodedQuery}`;

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Prometheus query failed: ${response.statusText}`);
		}

		const data = await response.json();
		return data.data.result;
	}

	/**
	 * Get all services from Prometheus
	 */
	private async getAllServices(): Promise<string[]> {
		try {
			const result = await this.queryPrometheus(
				'group by (exported_service) (lyku_requests_total)',
			);
			return result
				.map((item: any) => item.metric.exported_service)
				.filter((service: string) => service && service !== 'null')
				.sort();
		} catch (error) {
			this.logger.error('Failed to get services from Prometheus', { error });
			return [];
		}
	}

	/**
	 * Get metrics for a specific service
	 */
	private async getServiceMetrics(serviceName: string): Promise<RouteMetrics> {
		try {
			// Query multiple metrics in parallel
			const [
				statusResult,
				requestRateResult,
				errorRateResult,
				responseTimeResult,
				memoryUsageResult,
				inFlightResult,
			] = await Promise.all([
				this.queryPrometheus(`up{job="lyku-${serviceName}-service"}`),
				this.queryPrometheus(
					`rate(lyku_requests_total{exported_service="${serviceName}"}[5m])`,
				),
				this.queryPrometheus(
					`rate(lyku_requests_errors_total{exported_service="${serviceName}"}[5m])`,
				),
				this.queryPrometheus(
					`lyku_requests_duration_ms{exported_service="${serviceName}"}`,
				),
				this.queryPrometheus(
					`lyku_memory_usage_bytes{exported_service="${serviceName}"}`,
				),
				this.queryPrometheus(
					`lyku_requests_in_flight{exported_service="${serviceName}"}`,
				),
			]);

			// Extract values from results
			const getValue = (result: any[]): number => {
				return result.length > 0 && result[0].value.length > 1
					? parseFloat(result[0].value[1])
					: 0;
			};

			return {
				service: serviceName,
				status: getValue(statusResult) === 1 ? 'up' : 'down',
				requestRate: getValue(requestRateResult),
				errorRate: getValue(errorRateResult),
				responseTime: getValue(responseTimeResult),
				memoryUsage: getValue(memoryUsageResult),
				inFlightRequests: getValue(inFlightResult),
				lastUpdated: Date.now(),
			};
		} catch (error) {
			this.logger.error(`Failed to get metrics for service ${serviceName}`, {
				error,
			});
			return {
				service: serviceName,
				status: 'down',
				requestRate: 0,
				errorRate: 0,
				responseTime: 0,
				memoryUsage: 0,
				inFlightRequests: 0,
				lastUpdated: Date.now(),
			};
		}
	}

	/**
	 * Run aggregation job
	 */
	private async runAggregation(): Promise<void> {
		if (this.isShuttingDown) {
			return;
		}

		try {
			this.logger.info('Starting route metrics aggregation job');
			const startTime = Date.now();

			// Get all services
			const services = await this.getAllServices();
			this.logger.info(`Found ${services.length} services to query`);

			// Get metrics for all services
			const allMetrics = await Promise.all(
				services.map((service) => this.getServiceMetrics(service)),
			);

			// Store in Redis
			const pipeline = redis.pipeline();

			// Store overall metrics
			pipeline.set('route_metrics:all', pack(allMetrics));
			pipeline.set('route_metrics:timestamp', Date.now());
			pipeline.set('route_metrics:count', allMetrics.length);

			// Store individual service metrics
			for (const metrics of allMetrics) {
				pipeline.set(`route_metrics:service:${metrics.service}`, pack(metrics));
			}

			// Store service list
			pipeline.set('route_metrics:services', pack(services));

			await pipeline.exec();

			const duration = Date.now() - startTime;
			this.metrics.recordHistogram(
				'statisto_aggregation_duration_ms',
				duration,
			);
			this.metrics.recordGauge('statisto_services_count', services.length);

			this.logger.info('Route metrics aggregation job completed', {
				durationMs: duration,
				servicesCount: services.length,
			});
		} catch (error) {
			this.metrics.incrementCounter('statisto_aggregation_failures');
			this.logger.error('Route metrics aggregation job failed', { error });
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

			// Check Prometheus connectivity
			const promStartTime = Date.now();
			await this.queryPrometheus('up');
			const promLatency = Date.now() - promStartTime;
			this.metrics.recordGauge('prometheus_ping_latency_ms', promLatency);

			this.logger.debug('Health check completed', {
				redisLatencyMs: redisLatency,
				prometheusLatencyMs: promLatency,
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
