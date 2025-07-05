import { createLogger } from '@lyku/logger';
import { client as redis } from '@lyku/redis-client';
import { createMetricsClient } from '@lyku/metrics';
import { pack, unpack } from 'msgpackr';
import fetch from 'node-fetch';
import { RouteStatus } from '@lyku/json-models';
import { RedisLock } from '@lyku/locker';

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

interface HistoricalDataPoint {
	timestamp: number;
	status: 'up' | 'down';
	responseTime: number;
	errorRate: number;
}

interface UptimeStats {
	uptime24h: number;
	uptime7d: number;
	uptime30d: number;
	uptime90d: number;
	incidents24h: number;
	incidents7d: number;
	incidents30d: number;
	averageResponseTime24h: number;
	averageResponseTime7d: number;
}

interface ServiceMetricsWithUptime extends RouteStatus {
	uptimeStats: UptimeStats;
}

interface Incident {
	service: string;
	startTime: number;
	endTime?: number;
	duration?: number;
	reason?: string;
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
	private serviceLock: RedisLock | null = null;

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

		// Release service lock
		if (this.serviceLock) {
			await this.serviceLock.release();
			this.serviceLock = null;
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
	private async getServiceMetrics(serviceName: string): Promise<RouteStatus> {
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

		// Create lock for this specific job
		const lock = new RedisLock(
			this.config.serviceName,
			this.config.aggregationIntervalMs * 2,
		);

		try {
			// Try to acquire lock
			const acquired = await lock.acquire();
			if (!acquired) {
				this.logger.debug(
					'Aggregation job skipped - another instance is running',
				);
				return;
			}

			this.logger.info('Starting route metrics aggregation job');
			const startTime = Date.now();

			// Get all services
			const services = await this.getAllServices();
			this.logger.info(`Found ${services.length} services to query`);

			// Get metrics for all services
			const allMetrics = await Promise.all(
				services.map((service) => this.getServiceMetrics(service)),
			);

			// Store current metrics and historical data
			await this.storeMetricsWithHistory(allMetrics, services);

			// Calculate and store uptime statistics
			const allUptimeStats =
				await this.calculateAndStoreUptimeStats(allMetrics);

			// Create consolidated metrics with uptime for O(1) retrieval
			await this.storeConsolidatedMetrics(allMetrics, allUptimeStats);

			// Check for incidents and update incident tracking
			await this.updateIncidentTracking(allMetrics);

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
		} finally {
			await lock.release();
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

			// Start HTTP server on port 3000 or from environment variable
			const httpPort = parseInt(
				process.env.PORT || process.env.HEALTH_CHECK_PORT || '3000',
				10,
			);
			this.healthServer = startHealthCheckServer(httpPort, this);

			this.logger.info(
				`Kubernetes health check server started on port ${httpPort}`,
			);
		} catch (error) {
			this.logger.error('Failed to start health check server', { error });
		}
	}

	/**
	 * Store metrics with historical data
	 */
	private async storeMetricsWithHistory(
		allMetrics: RouteStatus[],
		services: string[],
	): Promise<void> {
		const now = Date.now();
		const pipeline = redis.pipeline();

		// Store current metrics
		pipeline.set('route_metrics:all', pack(allMetrics));
		pipeline.set('route_metrics:timestamp', now);
		pipeline.set('route_metrics:count', allMetrics.length);
		pipeline.set('route_metrics:services', pack(services));

		// Store individual service metrics and historical data
		for (const metrics of allMetrics) {
			// Current metrics
			pipeline.set(`route_metrics:service:${metrics.service}`, pack(metrics));

			// Historical data point
			const dataPoint: HistoricalDataPoint = {
				timestamp: now,
				status: metrics.status,
				responseTime: metrics.responseTime,
				errorRate: metrics.errorRate,
			};

			// Store in time-series buckets (5-minute resolution)
			pipeline.zadd(`history:5min:${metrics.service}`, now, pack(dataPoint));
			pipeline.expire(`history:5min:${metrics.service}`, 24 * 60 * 60);

			// Hourly aggregates (keep for 90 days)
			const bucket1hour = Math.floor(now / (60 * 60 * 1000));
			pipeline.hset(
				`history:hourly:${metrics.service}:${bucket1hour}`,
				now.toString(),
				pack(dataPoint),
			);
			pipeline.expire(
				`history:hourly:${metrics.service}:${bucket1hour}`,
				90 * 24 * 60 * 60,
			);

			// Daily aggregates (keep for 1 year)
			const bucket1day = Math.floor(now / (24 * 60 * 60 * 1000));
			pipeline.hset(
				`history:daily:${metrics.service}:${bucket1day}`,
				now.toString(),
				pack(dataPoint),
			);
			pipeline.expire(
				`history:daily:${metrics.service}:${bucket1day}`,
				365 * 24 * 60 * 60,
			);
		}

		await pipeline.exec();
	}

	/**
	 * Calculate and store uptime statistics
	 */
	private async calculateAndStoreUptimeStats(
		allMetrics: RouteStatus[],
	): Promise<Map<string, UptimeStats>> {
		const now = Date.now();
		const pipeline = redis.pipeline();
		const uptimeStatsMap = new Map<string, UptimeStats>();

		for (const metrics of allMetrics) {
			const stats: UptimeStats = await this.calculateUptimeForService(
				metrics.service,
				now,
			);
			uptimeStatsMap.set(metrics.service, stats);
			pipeline.set(`uptime_stats:${metrics.service}`, pack(stats));
		}

		await pipeline.exec();
		return uptimeStatsMap;
	}

	/**
	 * Store consolidated metrics with uptime for O(1) retrieval
	 */
	private async storeConsolidatedMetrics(
		allMetrics: RouteStatus[],
		allUptimeStats: Map<string, UptimeStats>,
	): Promise<void> {
		const consolidatedMetrics: ServiceMetricsWithUptime[] = allMetrics.map(
			(metrics) => ({
				...metrics,
				uptimeStats: allUptimeStats.get(metrics.service) || {
					uptime24h: 100,
					uptime7d: 100,
					uptime30d: 100,
					uptime90d: 100,
					incidents24h: 0,
					incidents7d: 0,
					incidents30d: 0,
					averageResponseTime24h: 0,
					averageResponseTime7d: 0,
				},
			}),
		);

		// Store consolidated metrics for O(1) retrieval by list-route-metrics
		await redis.set('route_metrics:consolidated', pack(consolidatedMetrics));

		this.logger.info(
			`Stored consolidated metrics for ${consolidatedMetrics.length} services`,
		);
	}

	/**
	 * Calculate uptime statistics for a service
	 */
	private async calculateUptimeForService(
		service: string,
		now: number,
	): Promise<UptimeStats> {
		const ranges = [
			{ name: '24h', ms: 24 * 60 * 60 * 1000 },
			{ name: '7d', ms: 7 * 24 * 60 * 60 * 1000 },
			{ name: '30d', ms: 30 * 24 * 60 * 60 * 1000 },
		];

		const stats: any = {
			uptime24h: 100,
			uptime7d: 100,
			uptime30d: 100,
			uptime90d: 100,
			incidents24h: 0,
			incidents7d: 0,
			incidents30d: 0,
			averageResponseTime24h: 0,
			averageResponseTime7d: 0,
		};

		// Get historical data for 24h (from 5-minute buckets)
		const history24h = await redis.zrangebyscoreBuffer(
			`history:5min:${service}`,
			now - ranges[0].ms,
			now,
		);

		if (history24h.length > 0) {
			let upCount = 0;
			let totalResponseTime = 0;
			let responseTimeCount = 0;

			for (const item of history24h) {
				const point = unpack(item) as HistoricalDataPoint;
				if (point.status === 'up') upCount++;
				if (point.responseTime > 0) {
					totalResponseTime += point.responseTime;
					responseTimeCount++;
				}
			}

			stats.uptime24h = (upCount / history24h.length) * 100;
			stats.averageResponseTime24h =
				responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;
		}

		// Get incident counts
		const incidents = await redis.zrangebyscoreBuffer(
			`incidents:${service}`,
			now - ranges[2].ms, // Last 30 days
			now,
		);

		for (const incidentData of incidents) {
			const incident = unpack(incidentData) as Incident;
			const incidentTime = incident.startTime;

			if (incidentTime >= now - ranges[0].ms) stats.incidents24h++;
			if (incidentTime >= now - ranges[1].ms) stats.incidents7d++;
			if (incidentTime >= now - ranges[2].ms) stats.incidents30d++;
		}

		return stats as UptimeStats;
	}

	/**
	 * Track incidents (downtime events)
	 */
	private async updateIncidentTracking(
		allMetrics: RouteStatus[],
	): Promise<void> {
		const now = Date.now();
		const pipeline = redis.pipeline();

		for (const metrics of allMetrics) {
			const incidentKey = `incident:current:${metrics.service}`;
			const currentIncident = await redis.getBuffer(incidentKey);

			if (metrics.status === 'down') {
				// Service is down
				if (!currentIncident) {
					// New incident
					const incident: Incident = {
						service: metrics.service,
						startTime: now,
						reason:
							metrics.errorRate > 0 ? 'High error rate' : 'Service unreachable',
					};

					pipeline.set(incidentKey, pack(incident));
					pipeline.zadd(`incidents:${metrics.service}`, now, pack(incident));

					this.logger.error(`Service ${metrics.service} is DOWN`, {
						service: metrics.service,
						errorRate: metrics.errorRate,
						responseTime: metrics.responseTime,
					});
				}
			} else if (currentIncident) {
				// Service is up but there was an incident
				const incident = unpack(currentIncident) as Incident;
				incident.endTime = now;
				incident.duration = now - incident.startTime;

				// Update the incident with end time
				pipeline.zrem(`incidents:${metrics.service}`, currentIncident);
				pipeline.zadd(
					`incidents:${metrics.service}`,
					incident.startTime,
					pack(incident),
				);
				pipeline.del(incidentKey);

				this.logger.info(`Service ${metrics.service} RECOVERED`, {
					service: metrics.service,
					downtimeDuration: incident.duration,
					downtimeMinutes: Math.round(incident.duration / 60000),
				});
			}

			// Cleanup old incidents (keep for 1 year)
			pipeline.zremrangebyscore(
				`incidents:${metrics.service}`,
				0,
				now - 365 * 24 * 60 * 60 * 1000,
			);
		}

		await pipeline.exec();
	}
}
