import { LeaderboardAwarderService, LeaderboardAwarderServiceConfig } from '.';

/**
 * Main function to start the leaderboard awarder service
 */
async function main() {
	// Read configuration from environment variables
	const config = {
		serviceName: process.env.SERVICE_NAME || 'lyku-leaderboard-awarder',
		environment: process.env.NODE_ENV || 'development',
		redisUrl:
			process.env.REDIS_INTERNAL_CONNECTION_STRING || 'redis://redis:6379',
		postgresUrl:
			process.env.PG_CONNECTION_STRING || 'postgres://localhost:5432/lyku',
		enableRecovery: process.env.ENABLE_RECOVERY === 'true',
		enableMonitoring: process.env.ENABLE_MONITORING !== 'false',
		checkIntervalMs: parseInt(process.env.CHECK_INTERVAL_MS || '3600000', 10), // 1 hour (not used since we schedule precisely)
		healthCheckIntervalMs: parseInt(
			process.env.HEALTH_CHECK_INTERVAL_MS || '300000',
			10,
		), // 5 minutes
		k8sEnabled: process.env.K8S_ENABLED !== 'false', // Enable by default
	} satisfies LeaderboardAwarderServiceConfig;

	// Create and start leaderboard awarder service
	const leaderboardService = new LeaderboardAwarderService(config);

	// Handle graceful shutdown
	const handleShutdown = async () => {
		console.log('Received shutdown signal');
		await leaderboardService.stop();
		process.exit(0);
	};

	process.on('SIGTERM', handleShutdown);
	process.on('SIGINT', handleShutdown);

	try {
		await leaderboardService.initialize();
		await leaderboardService.start();
	} catch (error) {
		console.error('Failed to start leaderboard awarder service', error);
		process.exit(1);
	}
}
main().catch(console.error);

export { LeaderboardAwarderService };
