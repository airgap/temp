import {
	createLogger,
	createClickHouseLogger,
	initializeClickHouseLogging,
	requestLogger,
	initializeLogging,
} from '../src/index.js';

// Example 1: Basic Logger
console.log('=== Basic Logger Example ===');

const basicLogger = createLogger({
	name: 'my-service',
	level: 'info',
	component: 'api',
	pretty: true, // Enable pretty printing for development
});

basicLogger.info('Service starting up', { port: 3000, version: '1.0.0' });
basicLogger.debug("This won't show because level is info");
basicLogger.warn('Database connection slow', { latency: 250 });
basicLogger.error('Failed to process request', {
	error: 'Connection timeout',
	userId: 'user-123',
	requestId: 'req-456',
});

// Example 2: ClickHouse Logger
console.log('\n=== ClickHouse Logger Example ===');

async function setupClickHouseLogging() {
	try {
		// Initialize the ClickHouse table first
		await initializeClickHouseLogging('application_logs');

		const clickhouseLogger = createClickHouseLogger({
			name: 'user-service',
			component: 'authentication',
			level: 'debug',
			enableClickHouse: true,
			clickHouseTable: 'application_logs',
			clickHouseBatchSize: 50,
			clickHouseBatchInterval: 5000,
			baseMetadata: {
				version: '2.1.0',
				datacenter: 'us-east-1',
			},
		});

		// These logs will go to both console and ClickHouse
		clickhouseLogger.info('User authentication started', {
			userId: 'user-789',
			method: 'oauth',
			provider: 'google',
		});

		clickhouseLogger.debug('Validating token', {
			tokenType: 'jwt',
			expiresIn: 3600,
		});

		clickhouseLogger.error('Authentication failed', {
			userId: 'user-789',
			reason: 'invalid_token',
			attempts: 3,
		});

		console.log('ClickHouse logging configured successfully');
	} catch (error) {
		console.error('Failed to setup ClickHouse logging:', error);
	}
}

// Example 3: Child Loggers
console.log('\n=== Child Logger Example ===');

const parentLogger = createLogger({
	name: 'order-service',
	component: 'payment-processor',
});

// Create child loggers with additional context
const orderLogger = parentLogger.child({
	orderId: 'order-12345',
	customerId: 'customer-67890',
});

const paymentLogger = orderLogger.child({
	paymentMethod: 'credit_card',
	provider: 'stripe',
});

orderLogger.info('Processing new order', { amount: 99.99, currency: 'USD' });
paymentLogger.info('Charging customer');
paymentLogger.warn('Payment processing slow', { duration: 5000 });
orderLogger.info('Order completed successfully');

// Example 4: Security Redaction
console.log('\n=== Security Redaction Example ===');

const secureLogger = createLogger({
	name: 'payment-service',
	redactFields: ['creditCard', 'ssn', 'password', 'secret', 'token'],
});

secureLogger.info('Processing payment', {
	userId: 'user-123',
	amount: 50.0,
	creditCard: '4111-1111-1111-1111', // Will be redacted
	password: 'user-password', // Will be redacted
	token: 'stripe-token-xyz', // Will be redacted
	orderId: 'order-456', // Safe to log
	user: {
		email: 'user@example.com',
		secret: 'api-key-123', // Will be redacted (nested)
	},
});

// Example 5: HTTP Request Logging Middleware
console.log('\n=== HTTP Request Logging Example ===');

// For Express.js applications
const httpLogger = requestLogger({
	level: 'info',
	ignorePaths: ['/health', '/metrics', '/favicon.ico'],
	customProps: (req: any, res: any) => ({
		traceId: req.headers['x-trace-id'],
		userId: req.user?.id,
		userAgent: req.headers['user-agent'],
	}),
});

// Example middleware usage (pseudo-code)
console.log('HTTP request middleware configured');
console.log('Use: app.use(httpLogger)');

// Example 6: Global Error Handling
console.log('\n=== Global Error Handling Example ===');

const globalLogger = initializeLogging({
	name: 'critical-service',
	level: 'info',
	enableClickHouse: true,
	clickHouseTable: 'error_logs',
});

// This sets up handlers for uncaught exceptions and unhandled rejections
globalLogger.info('Global error handling initialized');

// Example 7: Conditional Logging
console.log('\n=== Conditional Logging Example ===');

const perfLogger = createLogger({
	name: 'performance-service',
	level: 'debug',
});

// Only perform expensive operations if the level is enabled
if (perfLogger.isLevelEnabled('debug')) {
	const performanceData = {
		memoryUsage: process.memoryUsage(),
		cpuUsage: process.cpuUsage(),
		uptime: process.uptime(),
	};

	perfLogger.debug('Performance metrics', performanceData);
}

// Example 8: Different Log Levels
console.log('\n=== Log Levels Example ===');

const levelLogger = createLogger({
	name: 'demo-service',
	level: 'trace', // Enable all levels
});

levelLogger.trace('Very detailed trace information', {
	function: 'processData',
	step: 'validation',
});

levelLogger.debug('Debug information for developers', {
	variables: { x: 1, y: 2 },
	state: 'processing',
});

levelLogger.info('General information', {
	event: 'user_login',
	timestamp: new Date().toISOString(),
});

levelLogger.warn('Warning condition detected', {
	condition: 'high_memory_usage',
	threshold: '80%',
	current: '85%',
});

levelLogger.error('Error occurred', {
	error: 'Database connection failed',
	retryCount: 3,
	nextRetryIn: '30s',
});

levelLogger.fatal('System is unusable', {
	error: 'Critical service down',
	action: 'emergency_shutdown',
});

// Run the ClickHouse example
setupClickHouseLogging();

console.log('\n=== Examples completed ===');
console.log('Check your ClickHouse instance for logged data!');
