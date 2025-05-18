import pino from 'pino';
// import { hostname } from 'os';

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
	 * Whether to pretty print logs (only for development)
	 * @default false in production, true otherwise
	 */
	pretty?: boolean;

	/**
	 * Additional base metadata to include with every log
	 */
	baseMetadata?: Record<string, any>;

	/**
	 * Redact sensitive fields from logs
	 * @default ['password', 'secret', 'token', 'authorization', 'cookie', 'key']
	 */
	redactFields?: string[];
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
}

/**
 * Implementation of the Logger interface using Pino
 */
class PinoLogger implements Logger {
	// Changed to protected so it can be accessed in child method
	protected logger: pino.Logger;

	constructor(options?: LoggerOptions) {
		if (!options) {
			// Empty constructor for child loggers
			// The logger property will be set by the child method
			this.logger = undefined as any;
			return;
		}
		const isProduction =
			(options.environment || process.env.NODE_ENV) === 'production';

		const pinoOptions: pino.LoggerOptions = {
			name: options.name || 'lyku-service',
			level: options.level || (isProduction ? 'info' : 'debug'),
			base: {
				environment:
					options.environment || process.env.NODE_ENV || 'development',
				// hostname: hostname(),
				pid: process.pid,
				...(options.component ? { component: options.component } : {}),
				...(options.baseMetadata || {}),
			},
			redact: {
				paths: options.redactFields || [
					'password',
					'secret',
					'token',
					'authorization',
					'cookie',
					'key',
					'*.password',
					'*.secret',
					'*.token',
					'*.authorization',
					'*.cookie',
					'*.key',
				],
				censor: '[REDACTED]',
			},
			messageKey: 'message',
			timestamp: pino.stdTimeFunctions.isoTime,
			formatters: {
				level: (label) => ({ level: label }),
			},
		};

		// Set up transport for pretty printing if needed
		const transport =
			options.pretty && !isProduction
				? {
						target: 'pino-pretty',
						options: {
							colorize: true,
							translateTime: 'SYS:standard',
							ignore: 'pid,hostname',
						},
					}
				: undefined;

		this.logger = pino({
			...pinoOptions,
			transport,
		});
	}

	trace(message: string, meta: Record<string, any> = {}): void {
		this.logger.trace(meta, message);
	}

	debug(message: string, meta: Record<string, any> = {}): void {
		this.logger.debug(meta, message);
	}

	info(message: string, meta: Record<string, any> = {}): void {
		this.logger.info(meta, message);
	}

	warn(message: string, meta: Record<string, any> = {}): void {
		this.logger.warn(meta, message);
	}

	error(message: string, meta: Record<string, any> = {}): void {
		this.logger.error(meta, message);
	}

	fatal(message: string, meta: Record<string, any> = {}): void {
		this.logger.fatal(meta, message);
	}

	child(bindings: Record<string, any>): Logger {
		// Create a new logger from the child pino logger
		const childLogger = new PinoLogger();
		// Replace the internal logger with the child
		childLogger.logger = this.logger.child(bindings);
		return childLogger;
	}

	isLevelEnabled(level: LogLevel): boolean {
		return this.logger.isLevelEnabled(level);
	}
}

/**
 * Create a new logger instance
 */
export function createLogger(options: LoggerOptions = {}): Logger {
	return new PinoLogger(options);
}

/**
 * Default logger instance
 */
export const defaultLogger = createLogger();

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
 * Create a logger that also sends logs to a remote logging service
 */
export function createRemoteLogger(
	options: LoggerOptions & {
		remoteUrl: string;
		batchSize?: number;
		batchIntervalMs?: number;
	},
): Logger {
	// This would be implemented with a service like Loggly, DataDog, or a custom solution
	// For now, we'll just return a regular logger with a note
	const logger = createLogger(options);
	logger.info('Remote logging would be initialized here', {
		remoteUrl: options.remoteUrl,
	});

	return logger;
}
