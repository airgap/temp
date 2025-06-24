import {
	RouteMetricsAggregationService,
	RouteMetricsAggregationServiceConfig,
} from '.';

/**
 * Main function to start the worker service
 */
async function main() {
	// Read configuration from environment variables
	const config = {
		serviceName: process.env.SERVICE_NAME || 'lyku-statisto',
		environment: process.env.NODE_ENV || 'development',
		redisUrl:
			process.env.REDIS_INTERNAL_CONNECTION_STRING || 'redis://redis:6379',
		prometheusUrl:
			process.env.PROMETHEUS_URL ||
			'http://kube-prometheus-stack-prometheus.kube-prometheus-stack.svc.cluster.local:9090',
		enableMonitoring: process.env.ENABLE_MONITORING !== 'false',
		aggregationIntervalMs: parseInt(
			process.env.AGGREGATION_INTERVAL_MS || '30000',
			10,
		), // 30 seconds default
		healthCheckIntervalMs: parseInt(
			process.env.HEALTH_CHECK_INTERVAL_MS || '60000',
			10,
		), // 1 minute
		k8sEnabled: process.env.K8S_ENABLED !== 'false', // Enable by default
	} satisfies RouteMetricsAggregationServiceConfig;

	// Create and start worker service
	const workerService = new RouteMetricsAggregationService(config);

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
main().catch(console.error);

export { RouteMetricsAggregationService as ReactionWorkerService };
