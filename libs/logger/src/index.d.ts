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
 * Create a new logger instance
 */
export declare function createLogger(options?: LoggerOptions): Logger;
/**
 * Default logger instance
 */
export declare const defaultLogger: Logger;
/**
 * Request logger middleware for Express
 */
export declare function requestLogger(options: {
	level?: LogLevel;
	ignorePaths?: string[];
	customProps?: (req: any, res: any) => Record<string, any>;
}): (req: any, res: any, next: () => void) => void;
/**
 * Initialize logger and handle uncaught exceptions and unhandled rejections
 */
export declare function initializeLogging(options?: LoggerOptions): Logger;
/**
 * Create a logger that also sends logs to a remote logging service
 */
export declare function createRemoteLogger(
	options: LoggerOptions & {
		remoteUrl: string;
		batchSize?: number;
		batchIntervalMs?: number;
	},
): Logger;
