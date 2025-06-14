import { createClickhouseClient } from '@lyku/clickhouse-client';

/**
 * Available log levels for the logger
 */
export type LogLevel =
	| 'trace'
	| 'debug'
	| 'info'
	| 'warn'
	| 'error'
	| 'fatal'
	| 'silent';

/**
 * Configuration options for the logger
 */
export interface LoggerOptions {
	/**
	 * Name of the logger (usually service name)
	 * @default 'lyku-service'
	 */
	name?: string;

	/**
	 * Log level
	 * @default 'info'
	 */
	level?: LogLevel;

	/**
	 * Component name within the service
	 */
	component?: string;

	/**
	 * Environment (production, development, etc.)
	 * @default process.env.NODE_ENV || 'development'
	 */
	environment?: string;

	/**
	 * Additional base metadata to include with every log
	 */
	baseMetadata?: Record<string, any>;

	/**
	 * ClickHouse table name for logs
	 * @default 'logs'
	 */
	clickHouseTable?: string;

	/**
	 * Batch size for ClickHouse logging
	 * @default 100
	 */
	clickHouseBatchSize?: number;

	/**
	 * Batch interval in milliseconds for ClickHouse logging
	 * @default 5000
	 */
	clickHouseBatchInterval?: number;

	/**
	 * Enable console fallback when ClickHouse is unavailable
	 * @default false
	 */
	consoleFallback?: boolean;

	/**
	 * Enable debug logging to see what's happening
	 * @default false
	 */
	debug?: boolean;
}

/**
 * Logger interface for LYKU services
 */
export interface Logger {
	/**
	 * Log at trace level
	 */
	trace(message: string, meta?: Record<string, any>): void;

	/**
	 * Log at debug level
	 */
	debug(message: string, meta?: Record<string, any>): void;

	/**
	 * Log at info level
	 */
	info(message: string, meta?: Record<string, any>): void;

	/**
	 * Log at warn level
	 */
	warn(message: string, meta?: Record<string, any>): void;

	/**
	 * Log at error level
	 */
	error(message: string, meta?: Record<string, any>): void;

	/**
	 * Log at fatal level
	 */
	fatal(message: string, meta?: Record<string, any>): void;

	/**
	 * Create a child logger with additional context
	 */
	child(bindings: Record<string, any>): Logger;

	/**
	 * Check if a specific level is enabled
	 */
	isLevelEnabled(level: LogLevel): boolean;

	/**
	 * Manually flush any pending logs to ClickHouse
	 */
	flush(): Promise<void>;
}

/**
 * ClickHouse log entry interface
 */
interface ClickHouseLogEntry {
	timestamp: string;
	level: string;
	message: string;
	service: string;
	component?: string;
	environment: string;
	pid: number;
	metadata: string; // JSON string of metadata
}

/**
 * Log level hierarchy for filtering
 */
const LOG_LEVELS: Record<LogLevel, number> = {
	trace: 10,
	debug: 20,
	info: 30,
	warn: 40,
	error: 50,
	fatal: 60,
	silent: 70,
};

/**
 * ClickHouse Logger Implementation
 */
class ClickHouseLogger implements Logger {
	private clickHouseClient: ReturnType<typeof createClickhouseClient>;
	private clickHouseBatch: ClickHouseLogEntry[] = [];
	private clickHouseOptions: {
		table: string;
		batchSize: number;
		batchInterval: number;
	};
	private batchTimer?: NodeJS.Timeout;
	private serviceName: string;
	private componentName?: string;
	private environment: string;
	private currentLogLevel: number;
	private baseMetadata: Record<string, any>;
	private consoleFallback: boolean;
	private debugEnabled: boolean;

	constructor(options: LoggerOptions = {}) {
		this.serviceName = options.name || 'lyku-service';
		this.componentName = options.component;
		this.environment =
			options.environment || process.env.NODE_ENV || 'development';
		this.baseMetadata = options.baseMetadata || {};
		this.consoleFallback = options.consoleFallback || false;
		this.debugEnabled = options.debug || false;

		const isProduction = this.environment === 'production';
		const defaultLevel = isProduction ? 'info' : 'debug';
		this.currentLogLevel = LOG_LEVELS[options.level || defaultLevel];

		this.clickHouseClient = createClickhouseClient();
		this.clickHouseOptions = {
			table: options.clickHouseTable || 'logs',
			batchSize: options.clickHouseBatchSize || 100,
			batchInterval: options.clickHouseBatchInterval || 5000,
		};

		this.setupClickHouseBatching();
	}

	private setupClickHouseBatching(): void {
		// Set up periodic batch flushing
		this.batchTimer = setInterval(() => {
			this.flushClickHouseBatch();
		}, this.clickHouseOptions.batchInterval);

		// Flush on process exit
		process.on('exit', () => this.flushClickHouseBatch());
		process.on('SIGINT', () => {
			this.flushClickHouseBatch();
			process.exit(0);
		});
		process.on('SIGTERM', () => {
			this.flushClickHouseBatch();
			process.exit(0);
		});
	}

	private async logToClickHouse(
		level: string,
		message: string,
		meta: Record<string, any> = {},
	): Promise<void> {
		const combinedMeta = { ...this.baseMetadata, ...meta };

		const logEntry: ClickHouseLogEntry = {
			timestamp: new Date().toISOString(),
			level,
			message,
			service: this.serviceName,
			component: this.componentName,
			environment: this.environment,
			pid: process.pid,
			metadata: JSON.stringify(combinedMeta, (k, v) =>
				typeof v === 'bigint' ? v.toString() : v,
			),
		};

		this.clickHouseBatch.push(logEntry);

		if (this.debugEnabled) {
			console.log(
				`[DEBUG] Added log to batch. Batch size: ${this.clickHouseBatch.length}/${this.clickHouseOptions.batchSize}`,
			);
		}

		// Flush if batch is full
		if (this.clickHouseBatch.length >= this.clickHouseOptions.batchSize) {
			if (this.debugEnabled) {
				console.log('[DEBUG] Batch full, flushing to ClickHouse');
			}
			await this.flushClickHouseBatch();
		}
	}

	private async flushClickHouseBatch(): Promise<void> {
		if (this.clickHouseBatch.length === 0) {
			if (this.debugEnabled) {
				console.log('[DEBUG] No logs to flush');
			}
			return;
		}

		const batch = [...this.clickHouseBatch];
		this.clickHouseBatch = [];

		if (this.debugEnabled) {
			console.log(
				`[DEBUG] Flushing ${batch.length} logs to ClickHouse table: ${this.clickHouseOptions.table}`,
			);
		}

		try {
			// Create minimal test data first
			const testEntry = {
				timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
				level: 'info',
				message: 'test message',
				service: 'test-service',
				component: null,
				environment: 'test',
				pid: 1,
				metadata: '{}',
			};

			if (this.debugEnabled) {
				console.log('[DEBUG] Test entry:', JSON.stringify(testEntry));
			}

			await this.clickHouseClient.insert({
				table: this.clickHouseOptions.table,
				values: [testEntry],
				format: 'JSONEachRow',
			});

			if (this.debugEnabled) {
				console.log(`[DEBUG] Successfully inserted test log to ClickHouse`);
			}
		} catch (error) {
			if (this.debugEnabled) {
				console.error('[DEBUG] ClickHouse insert failed:', error);
			}

			if (this.consoleFallback) {
				// Fallback to console logging if ClickHouse fails
				batch.forEach((entry) => {
					const logData = {
						...entry,
						metadata: JSON.parse(entry.metadata),
					};
					console.log(JSON.stringify(logData));
				});
			} else {
				// Log error to console but don't throw to avoid breaking the application
				console.error('Failed to insert logs to ClickHouse:', error);
			}

			// Put the batch back if it failed (for retry on next flush)
			this.clickHouseBatch.unshift(...batch);
		}
	}

	private log(
		level: LogLevel,
		message: string,
		meta: Record<string, any> = {},
	): void {
		if (!this.isLevelEnabled(level)) {
			if (this.debugEnabled) {
				console.log(
					`[DEBUG] Log level ${level} not enabled (current: ${this.currentLogLevel})`,
				);
			}
			return;
		}

		if (this.debugEnabled) {
			console.log(`[DEBUG] Logging ${level}: ${message}`);
		}

		this.logToClickHouse(level, message, meta).catch((error) => {
			if (this.debugEnabled) {
				console.error('[DEBUG] logToClickHouse error:', error);
			}
		});
	}

	trace(message: string, meta: Record<string, any> = {}): void {
		this.log('trace', message, meta);
	}

	debug(message: string, meta: Record<string, any> = {}): void {
		this.log('debug', message, meta);
	}

	info(message: string, meta: Record<string, any> = {}): void {
		this.log('info', message, meta);
	}

	warn(message: string, meta: Record<string, any> = {}): void {
		this.log('warn', message, meta);
	}

	error(message: string, meta: Record<string, any> = {}): void {
		this.log('error', message, meta);
	}

	fatal(message: string, meta: Record<string, any> = {}): void {
		this.log('fatal', message, meta);
	}

	child(bindings: Record<string, any>): Logger {
		const childLogger = new ClickHouseLogger({
			name: this.serviceName,
			component: this.componentName,
			environment: this.environment,
			baseMetadata: { ...this.baseMetadata, ...bindings },
			clickHouseTable: this.clickHouseOptions.table,
			clickHouseBatchSize: this.clickHouseOptions.batchSize,
			clickHouseBatchInterval: this.clickHouseOptions.batchInterval,
			consoleFallback: this.consoleFallback,
			debug: this.debugEnabled,
		});

		// Share the same ClickHouse client and batch
		childLogger.clickHouseClient = this.clickHouseClient;
		childLogger.clickHouseBatch = this.clickHouseBatch;
		childLogger.currentLogLevel = this.currentLogLevel;

		return childLogger;
	}

	isLevelEnabled(level: LogLevel): boolean {
		return LOG_LEVELS[level] >= this.currentLogLevel;
	}

	async flush(): Promise<void> {
		await this.flushClickHouseBatch();
	}
}

/**
 * Create a new logger instance
 */
export function createLogger(options: LoggerOptions = {}): Logger {
	return new ClickHouseLogger(options);
}

/**
 * Default logger instance
 */
export const defaultLogger = createLogger({
	clickHouseTable: 'logs',
	clickHouseBatchInterval: 100,
	clickHouseBatchSize: 1000,
	debug: true, // Enable debug to see what's happening
	consoleFallback: true, // Enable console fallback
});

/**
 * Request logger middleware for Express
 */
export function requestLogger(options: {
	level?: LogLevel;
	ignorePaths?: string[];
	customProps?: (req: any, res: any) => Record<string, any>;
}) {
	const logger = createLogger({
		name: 'lyku-http',
		level: options.level || 'info',
		component: 'http',
	});

	return (req: any, res: any, next: () => void) => {
		// Skip logging for ignored paths
		if (
			options.ignorePaths &&
			options.ignorePaths.some((path) => req.path.startsWith(path))
		) {
			return next();
		}

		const start = Date.now();

		// Capture original end method
		const originalEnd = res.end;

		// Override end method to log after response is sent
		res.end = function (...args: any[]) {
			// Calculate response time
			const responseTime = Date.now() - start;

			// Get custom properties if provided
			const customProps = options.customProps
				? options.customProps(req, res)
				: {};

			// Log the request
			logger.info(
				`${req.method} ${req.originalUrl || req.url} ${res.statusCode}`,
				{
					method: req.method,
					url: req.originalUrl || req.url,
					statusCode: res.statusCode,
					responseTime,
					ip:
						req.ip ||
						req.headers['x-forwarded-for'] ||
						req.connection.remoteAddress,
					userAgent: req.headers['user-agent'],
					...customProps,
				},
			);

			// Call original end method
			return originalEnd.apply(res, args);
		};

		next();
	};
}

/**
 * Initialize logger and handle uncaught exceptions and unhandled rejections
 */
export function initializeLogging(options: LoggerOptions = {}): Logger {
	const logger = createLogger(options);

	// Handle uncaught exceptions
	process.on('uncaughtException', (error) => {
		logger.fatal('Uncaught exception', {
			error: error.stack || error.toString(),
		});
		process.exit(1);
	});

	// Handle unhandled promise rejections
	process.on('unhandledRejection', (reason, promise) => {
		logger.error('Unhandled promise rejection', {
			reason: reason instanceof Error ? reason.stack : reason,
			promise,
		});
	});

	return logger;
}

/**
 * Initialize ClickHouse logging table
 */
export async function initializeClickHouseLogging(
	tableName: string = 'logs',
	cluster?: string,
): Promise<void> {
	const client = createClickhouseClient();

	const clusterClause = cluster ? `ON CLUSTER ${cluster}` : '';
	const createTableQuery = `
		CREATE TABLE IF NOT EXISTS ${tableName} ${clusterClause} (
			timestamp DateTime64(3) CODEC(DoubleDelta),
			level LowCardinality(String),
			message String,
			service LowCardinality(String),
			component Nullable(String),
			environment LowCardinality(String),
			pid UInt32,
			metadata String
		) ENGINE = MergeTree()
		ORDER BY (timestamp, service, level)
		TTL toDateTime(timestamp) + INTERVAL 90 DAY
		SETTINGS index_granularity = 8192
	`;

	try {
		await client.command({
			query: createTableQuery,
		});
		console.log(
			`ClickHouse logging table '${tableName}' initialized successfully${cluster ? ` on cluster '${cluster}'` : ''}`,
		);
	} catch (error) {
		console.error('Failed to initialize ClickHouse logging table:', error);
		throw error;
	}
}
