import { HotPostAggregationService, HotPostAggregationServiceConfig } from '.';

/**
 * Main function to start the worker service
 */
async function main() {
	// Read configuration from environment variables
	const config = {
		serviceName: process.env.SERVICE_NAME || 'lyku-aggie',
		environment: process.env.NODE_ENV || 'development',
		redisUrl:
			process.env.REDIS_INTERNAL_CONNECTION_STRING || 'redis://redis:6379',
		postgresUrl:
			process.env.PG_CONNECTION_STRING || 'postgres://localhost:5432/lyku',
		enableRecovery: process.env.ENABLE_RECOVERY === 'true',
		enableMonitoring: process.env.ENABLE_MONITORING !== 'false',
		aggregationIntervalMs: parseInt(
			process.env.AGGREGATION_INTERVAL_MS || '30000',
			10,
		), // 5 minutes
		healthCheckIntervalMs: parseInt(
			process.env.HEALTH_CHECK_INTERVAL_MS || '60000',
			10,
		), // 1 minute
		k8sEnabled: process.env.K8S_ENABLED !== 'false', // Enable by default
	} satisfies HotPostAggregationServiceConfig;

	// Create and start worker service
	const workerService = new HotPostAggregationService(config);

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

export { HotPostAggregationService as ReactionWorkerService };
