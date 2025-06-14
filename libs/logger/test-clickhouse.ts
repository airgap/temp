import {
	createClickHouseLogger,
	initializeClickHouseLogging,
} from './src/index.js';

async function testClickHouseLogger() {
	console.log('Testing ClickHouse Logger...');

	try {
		// Initialize the ClickHouse table
		console.log('Initializing ClickHouse table...');
		await initializeClickHouseLogging('test_logs');
		console.log('✓ ClickHouse table initialized');

		// Create a logger with ClickHouse enabled
		const logger = createClickHouseLogger({
			name: 'test-service',
			component: 'clickhouse-test',
			level: 'debug',
			enableClickHouse: true,
			clickHouseTable: 'test_logs',
			clickHouseBatchSize: 5, // Small batch for testing
			clickHouseBatchInterval: 2000, // 2 seconds
		});

		console.log('✓ Logger created with ClickHouse integration');

		// Test different log levels
		logger.info('Test info message', {
			testId: 'test-001',
			operation: 'startup',
		});
		logger.debug('Test debug message', { details: 'debugging info' });
		logger.warn('Test warning message', { warning: 'potential issue' });
		logger.error('Test error message', { error: 'test error', code: 500 });

		// Test child logger
		const childLogger = logger.child({
			userId: 'user-123',
			requestId: 'req-456',
		});
		childLogger.info('Child logger test', { action: 'user_action' });

		// Test security redaction
		logger.info('Security test', {
			username: 'testuser',
			password: 'secret123', // Should be redacted
			token: 'jwt-token-here', // Should be redacted
			publicData: 'this is safe',
		});

		console.log('✓ Log messages sent');
		console.log('Waiting for batch to flush to ClickHouse...');

		// Wait for logs to be flushed
		await new Promise((resolve) => setTimeout(resolve, 3000));

		console.log('✓ Test completed successfully');
	} catch (error) {
		console.error('✗ Test failed:', error);
		process.exit(1);
	}
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	testClickHouseLogger()
		.then(() => {
			console.log('All tests passed!');
			process.exit(0);
		})
		.catch((error) => {
			console.error('Test failed:', error);
			process.exit(1);
		});
}

export { testClickHouseLogger };
