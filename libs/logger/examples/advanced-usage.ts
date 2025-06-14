import {
	createLogger,
	createClickHouseLogger,
	initializeClickHouseLogging,
	requestLogger,
	initializeLogging,
	LoggerOptions,
} from '../src/index.js';

// Advanced Example 1: Custom ClickHouse Configuration
console.log('=== Advanced ClickHouse Configuration ===');

async function setupAdvancedClickHouseLogging() {
	try {
		// Create multiple tables for different log types
		await initializeClickHouseLogging('application_logs');
		await initializeClickHouseLogging('audit_logs');
		await initializeClickHouseLogging('performance_logs');

		// High-throughput service logger
		const highThroughputLogger = createClickHouseLogger({
			name: 'payment-processor',
			component: 'transaction-engine',
			level: 'info',
			enableClickHouse: true,
			clickHouseTable: 'application_logs',
			clickHouseBatchSize: 1000, // Large batch for high volume
			clickHouseBatchInterval: 1000, // Flush every second
			baseMetadata: {
				service_tier: 'critical',
				region: 'us-west-2',
				instance_id: process.env.INSTANCE_ID || 'local',
			},
		});

		// Audit logger with smaller batches for compliance
		const auditLogger = createClickHouseLogger({
			name: 'audit-service',
			component: 'compliance',
			level: 'info',
			enableClickHouse: true,
			clickHouseTable: 'audit_logs',
			clickHouseBatchSize: 10, // Small batch for immediate compliance logging
			clickHouseBatchInterval: 500, // Very frequent flushing
			redactFields: ['ssn', 'creditCard', 'bankAccount', 'password', 'secret'],
		});

		// Performance logger
		const perfLogger = createClickHouseLogger({
			name: 'performance-monitor',
			component: 'metrics',
			level: 'debug',
			enableClickHouse: true,
			clickHouseTable: 'performance_logs',
			clickHouseBatchSize: 500,
			clickHouseBatchInterval: 2000,
		});

		return { highThroughputLogger, auditLogger, perfLogger };
	} catch (error) {
		console.error('Failed to setup advanced ClickHouse logging:', error);
		throw error;
	}
}

// Advanced Example 2: Transaction Logging Pattern
console.log('\n=== Transaction Logging Pattern ===');

class TransactionLogger {
	private logger: any;
	private transactionId: string;
	private startTime: number;

	constructor(baseLogger: any, transactionId: string) {
		this.transactionId = transactionId;
		this.startTime = Date.now();
		this.logger = baseLogger.child({
			transactionId,
			transactionStart: new Date().toISOString(),
		});
	}

	start(operation: string, metadata: Record<string, any> = {}) {
		this.logger.info(`Transaction started: ${operation}`, {
			operation,
			...metadata,
		});
	}

	step(stepName: string, metadata: Record<string, any> = {}) {
		const elapsed = Date.now() - this.startTime;
		this.logger.debug(`Transaction step: ${stepName}`, {
			step: stepName,
			elapsedMs: elapsed,
			...metadata,
		});
	}

	error(error: string, metadata: Record<string, any> = {}) {
		const elapsed = Date.now() - this.startTime;
		this.logger.error(`Transaction error: ${error}`, {
			error,
			elapsedMs: elapsed,
			status: 'failed',
			...metadata,
		});
	}

	complete(result: string, metadata: Record<string, any> = {}) {
		const elapsed = Date.now() - this.startTime;
		this.logger.info(`Transaction completed: ${result}`, {
			result,
			elapsedMs: elapsed,
			status: 'success',
			...metadata,
		});
	}
}

// Advanced Example 3: Correlation ID Middleware
console.log('\n=== Correlation ID Middleware ===');

class CorrelationMiddleware {
	private logger: any;

	constructor(logger: any) {
		this.logger = logger;
	}

	generateCorrelationId(): string {
		return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	createCorrelatedLogger(correlationId?: string) {
		const id = correlationId || this.generateCorrelationId();
		return this.logger.child({
			correlationId: id,
			requestStart: new Date().toISOString(),
		});
	}

	expressMiddleware() {
		return (req: any, res: any, next: any) => {
			const correlationId =
				req.headers['x-correlation-id'] || this.generateCorrelationId();
			req.correlationId = correlationId;
			req.logger = this.createCorrelatedLogger(correlationId);

			res.setHeader('x-correlation-id', correlationId);

			req.logger.info('Request started', {
				method: req.method,
				url: req.url,
				userAgent: req.headers['user-agent'],
				ip: req.ip,
			});

			next();
		};
	}
}

// Advanced Example 4: Performance Monitoring
console.log('\n=== Performance Monitoring ===');

class PerformanceMonitor {
	private logger: any;
	private metrics: Map<string, { start: number; samples: number[] }> =
		new Map();

	constructor(logger: any) {
		this.logger = logger;
		this.startPeriodicReporting();
	}

	startOperation(operationId: string) {
		this.metrics.set(operationId, {
			start: Date.now(),
			samples: [],
		});
	}

	endOperation(operationId: string, metadata: Record<string, any> = {}) {
		const metric = this.metrics.get(operationId);
		if (!metric) return;

		const duration = Date.now() - metric.start;
		metric.samples.push(duration);

		this.logger.debug('Operation completed', {
			operationId,
			durationMs: duration,
			...metadata,
		});

		// Log slow operations
		if (duration > 5000) {
			this.logger.warn('Slow operation detected', {
				operationId,
				durationMs: duration,
				threshold: 5000,
				...metadata,
			});
		}
	}

	private startPeriodicReporting() {
		setInterval(() => {
			this.reportMetrics();
		}, 60000); // Report every minute
	}

	private reportMetrics() {
		for (const [operationId, metric] of this.metrics.entries()) {
			if (metric.samples.length === 0) continue;

			const avg =
				metric.samples.reduce((a, b) => a + b, 0) / metric.samples.length;
			const min = Math.min(...metric.samples);
			const max = Math.max(...metric.samples);

			this.logger.info('Performance metrics', {
				operationId,
				sampleCount: metric.samples.length,
				avgDurationMs: Math.round(avg),
				minDurationMs: min,
				maxDurationMs: max,
			});

			// Reset samples
			metric.samples = [];
		}
	}
}

// Advanced Example 5: Error Aggregation
console.log('\n=== Error Aggregation ===');

class ErrorAggregator {
	private logger: any;
	private errorCounts: Map<
		string,
		{ count: number; lastSeen: number; samples: any[] }
	> = new Map();

	constructor(logger: any) {
		this.logger = logger;
		this.startPeriodicReporting();
	}

	recordError(
		errorType: string,
		error: any,
		metadata: Record<string, any> = {},
	) {
		const key = `${errorType}:${error.message || error}`;
		const now = Date.now();

		if (!this.errorCounts.has(key)) {
			this.errorCounts.set(key, {
				count: 0,
				lastSeen: now,
				samples: [],
			});
		}

		const errorData = this.errorCounts.get(key)!;
		errorData.count++;
		errorData.lastSeen = now;
		errorData.samples.push({
			timestamp: now,
			stack: error.stack,
			...metadata,
		});

		// Keep only last 10 samples
		if (errorData.samples.length > 10) {
			errorData.samples = errorData.samples.slice(-10);
		}

		// Log individual error
		this.logger.error('Error occurred', {
			errorType,
			errorMessage: error.message || error,
			errorCount: errorData.count,
			...metadata,
		});
	}

	private startPeriodicReporting() {
		setInterval(() => {
			this.reportErrorSummary();
		}, 300000); // Report every 5 minutes
	}

	private reportErrorSummary() {
		if (this.errorCounts.size === 0) return;

		const summary = Array.from(this.errorCounts.entries()).map(
			([key, data]) => ({
				errorKey: key,
				count: data.count,
				lastSeen: new Date(data.lastSeen).toISOString(),
				recentSample: data.samples[data.samples.length - 1],
			}),
		);

		this.logger.warn('Error summary report', {
			totalErrorTypes: this.errorCounts.size,
			errors: summary,
		});

		// Reset counts after reporting
		this.errorCounts.clear();
	}
}

// Advanced Example 6: Circuit Breaker Logging
console.log('\n=== Circuit Breaker Logging ===');

enum CircuitState {
	CLOSED = 'closed',
	OPEN = 'open',
	HALF_OPEN = 'half_open',
}

class CircuitBreakerLogger {
	private logger: any;
	private serviceName: string;
	private state: CircuitState = CircuitState.CLOSED;
	private failureCount = 0;
	private lastFailureTime = 0;

	constructor(logger: any, serviceName: string) {
		this.logger = logger.child({ circuitBreaker: serviceName });
		this.serviceName = serviceName;
	}

	recordSuccess() {
		const previousState = this.state;
		this.failureCount = 0;
		this.state = CircuitState.CLOSED;

		if (previousState !== CircuitState.CLOSED) {
			this.logger.info('Circuit breaker state changed', {
				service: this.serviceName,
				previousState,
				newState: this.state,
				event: 'recovery',
			});
		}
	}

	recordFailure(error: any) {
		this.failureCount++;
		this.lastFailureTime = Date.now();

		this.logger.warn('Circuit breaker failure recorded', {
			service: this.serviceName,
			failureCount: this.failureCount,
			error: error.message,
			currentState: this.state,
		});

		if (this.failureCount >= 5 && this.state === CircuitState.CLOSED) {
			this.state = CircuitState.OPEN;
			this.logger.error('Circuit breaker opened', {
				service: this.serviceName,
				failureCount: this.failureCount,
				state: this.state,
				event: 'circuit_open',
			});
		}
	}

	attemptCall() {
		if (this.state === CircuitState.OPEN) {
			const timeSinceLastFailure = Date.now() - this.lastFailureTime;
			if (timeSinceLastFailure > 60000) {
				// 1 minute timeout
				this.state = CircuitState.HALF_OPEN;
				this.logger.info('Circuit breaker half-open', {
					service: this.serviceName,
					state: this.state,
					event: 'attempting_recovery',
				});
			} else {
				this.logger.debug('Circuit breaker call blocked', {
					service: this.serviceName,
					state: this.state,
					timeUntilRetry: 60000 - timeSinceLastFailure,
				});
				throw new Error('Circuit breaker is open');
			}
		}
	}
}

// Advanced Example 7: Structured Application Events
console.log('\n=== Structured Application Events ===');

interface ApplicationEvent {
	eventType: string;
	eventId: string;
	timestamp: string;
	userId?: string;
	sessionId?: string;
	metadata: Record<string, any>;
}

class EventLogger {
	private logger: any;

	constructor(logger: any) {
		this.logger = logger.child({ logType: 'application_event' });
	}

	logEvent(event: ApplicationEvent) {
		this.logger.info(`Event: ${event.eventType}`, {
			eventId: event.eventId,
			eventType: event.eventType,
			timestamp: event.timestamp,
			userId: event.userId,
			sessionId: event.sessionId,
			...event.metadata,
		});
	}

	userLogin(userId: string, sessionId: string, method: string) {
		this.logEvent({
			eventType: 'user_login',
			eventId: `login_${Date.now()}`,
			timestamp: new Date().toISOString(),
			userId,
			sessionId,
			metadata: { authMethod: method },
		});
	}

	userLogout(userId: string, sessionId: string, reason: string) {
		this.logEvent({
			eventType: 'user_logout',
			eventId: `logout_${Date.now()}`,
			timestamp: new Date().toISOString(),
			userId,
			sessionId,
			metadata: { reason },
		});
	}

	businessEvent(eventType: string, userId: string, data: Record<string, any>) {
		this.logEvent({
			eventType,
			eventId: `${eventType}_${Date.now()}`,
			timestamp: new Date().toISOString(),
			userId,
			metadata: data,
		});
	}
}

// Example usage of advanced patterns
async function demonstrateAdvancedUsage() {
	try {
		const { highThroughputLogger, auditLogger, perfLogger } =
			await setupAdvancedClickHouseLogging();

		// Transaction logging
		const txLogger = new TransactionLogger(highThroughputLogger, 'tx_12345');
		txLogger.start('payment_processing', { amount: 100.0, currency: 'USD' });
		txLogger.step('validate_payment', { validation: 'passed' });
		txLogger.step('charge_card', { provider: 'stripe' });
		txLogger.complete('payment_successful', {
			transactionId: 'stripe_tx_67890',
		});

		// Correlation middleware
		const correlationMiddleware = new CorrelationMiddleware(
			highThroughputLogger,
		);
		const correlatedLogger = correlationMiddleware.createCorrelatedLogger();
		correlatedLogger.info('Processing correlated request');

		// Performance monitoring
		const perfMonitor = new PerformanceMonitor(perfLogger);
		perfMonitor.startOperation('database_query');
		// Simulate some work
		await new Promise((resolve) => setTimeout(resolve, 100));
		perfMonitor.endOperation('database_query', { table: 'users', rows: 150 });

		// Error aggregation
		const errorAggregator = new ErrorAggregator(highThroughputLogger);
		errorAggregator.recordError(
			'DatabaseError',
			new Error('Connection timeout'),
			{
				operation: 'user_lookup',
			},
		);

		// Circuit breaker
		const circuitLogger = new CircuitBreakerLogger(
			highThroughputLogger,
			'payment-service',
		);
		circuitLogger.recordFailure(new Error('Service unavailable'));

		// Event logging
		const eventLogger = new EventLogger(auditLogger);
		eventLogger.userLogin('user_123', 'session_456', 'oauth');
		eventLogger.businessEvent('purchase_completed', 'user_123', {
			orderId: 'order_789',
			amount: 99.99,
			items: ['product_a', 'product_b'],
		});

		console.log('Advanced usage examples completed successfully');
	} catch (error) {
		console.error('Advanced usage demonstration failed:', error);
	}
}

// Run the demonstration
demonstrateAdvancedUsage();

console.log('\n=== Advanced Usage Examples Completed ===');
console.log('These patterns provide enterprise-grade logging capabilities');
