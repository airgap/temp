# LYKU Logger

A comprehensive logging library for LYKU services with support for structured logging, ClickHouse integration, and request tracing.

## Key Features

- **Structured Logging**: Uses Pino for high-performance structured logging
- **ClickHouse Integration**: Automatic log shipping to ClickHouse for analytics
- **Request Tracing**: Built-in HTTP request logging middleware
- **Child Loggers**: Create contextual loggers with additional metadata
- **Security**: Automatic redaction of sensitive fields
- **Production Ready**: Environment-specific configurations

## Quick Start

```typescript
import { createLogger, createClickHouseLogger } from '@lyku/logger';

// Basic logger
const logger = createLogger({
	name: 'my-service',
	level: 'info',
	component: 'api',
});

// Logger with ClickHouse integration
const clickhouseLogger = createClickHouseLogger({
	name: 'my-service',
	level: 'info',
	enableClickHouse: true,
	clickHouseTable: 'application_logs',
});

logger.info('Service started', { port: 3000 });
logger.error('Database connection failed', { error: 'Connection timeout' });
```

## Logger Options

```typescript
interface LoggerOptions {
	name?: string; // Service name (default: 'lyku-service')
	level?: LogLevel; // Log level (default: 'info' in production, 'debug' otherwise)
	component?: string; // Component name within the service
	environment?: string; // Environment (default: process.env.NODE_ENV)
	pretty?: boolean; // Pretty print logs (default: false in production)
	baseMetadata?: Record<string, any>; // Additional metadata for all logs
	redactFields?: string[]; // Fields to redact (default includes passwords, tokens, etc.)

	// ClickHouse options
	enableClickHouse?: boolean; // Enable ClickHouse logging (default: false)
	clickHouseTable?: string; // ClickHouse table name (default: 'logs')
	clickHouseBatchSize?: number; // Batch size for ClickHouse (default: 100)
	clickHouseBatchInterval?: number; // Batch interval in ms (default: 5000)
}
```

## ClickHouse Integration

### Setup

First, initialize the ClickHouse table:

```typescript
import { initializeClickHouseLogging } from '@lyku/logger';

// Initialize the logs table
await initializeClickHouseLogging('application_logs');
```

### Usage

```typescript
import { createClickHouseLogger } from '@lyku/logger';

const logger = createClickHouseLogger({
	name: 'user-service',
	component: 'authentication',
	enableClickHouse: true,
	clickHouseTable: 'application_logs',
	clickHouseBatchSize: 50,
	clickHouseBatchInterval: 3000,
});

// Logs will be sent to both console and ClickHouse
logger.info('User logged in', {
	userId: '123',
	method: 'oauth',
	duration: 250,
});
```

### ClickHouse Schema

The ClickHouse table has the following schema:

```sql
CREATE TABLE application_logs (
  timestamp DateTime64(3) CODEC(DoubleDelta),
  level LowCardinality(String),
  message String,
  service LowCardinality(String),
  component LowCardinality(String),
  environment LowCardinality(String),
  pid UInt32,
  metadata String
) ENGINE = MergeTree()
ORDER BY (timestamp, service, level)
TTL timestamp + INTERVAL 90 DAY
```

## HTTP Request Logging

```typescript
import express from 'express';
import { requestLogger } from '@lyku/logger';

const app = express();

app.use(
	requestLogger({
		level: 'info',
		ignorePaths: ['/health', '/metrics'],
		customProps: (req, res) => ({
			traceId: req.headers['x-trace-id'],
			userId: req.user?.id,
		}),
	}),
);
```

## Child Loggers

Create contextual loggers with additional metadata:

```typescript
const logger = createLogger({ name: 'order-service' });

// Create a child logger for a specific order
const orderLogger = logger.child({
	orderId: 'order-123',
	customerId: 'customer-456',
});

orderLogger.info('Processing payment');
orderLogger.error('Payment failed', { reason: 'insufficient_funds' });
```

## Log Levels

Available log levels (in order of priority):

- `fatal` - System is unusable
- `error` - Error conditions
- `warn` - Warning conditions
- `info` - Informational messages
- `debug` - Debug messages
- `trace` - Very detailed debug information
- `silent` - No logging

```typescript
logger.trace('Detailed trace information');
logger.debug('Debug information');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error occurred');
logger.fatal('System is down');

// Check if level is enabled
if (logger.isLevelEnabled('debug')) {
	logger.debug('Expensive debug operation', expensiveOperation());
}
```

## Security Features

Sensitive fields are automatically redacted from logs:

```typescript
logger.info('User login attempt', {
	username: 'john@example.com',
	password: 'secret123', // Will be redacted
	token: 'jwt-token-here', // Will be redacted
	metadata: {
		secret: 'api-key', // Will be redacted
		publicInfo: 'safe-data', // Will be logged
	},
});
```

Default redacted fields:

- `password`, `secret`, `token`, `authorization`, `cookie`, `key`
- Nested fields: `*.password`, `*.secret`, `*.token`, etc.

## Environment Configuration

The logger automatically configures based on environment:

```bash
# Environment variables
NODE_ENV=production          # Affects default log level and pretty printing
CH_ENDPOINT=http://localhost:8123  # ClickHouse endpoint
CH_USERNAME=default          # ClickHouse username
CH_PASSWORD=password         # ClickHouse password
```

## Error Handling

Initialize logging with global error handlers:

```typescript
import { initializeLogging } from '@lyku/logger';

const logger = initializeLogging({
	name: 'my-service',
	level: 'info',
});

// Uncaught exceptions and unhandled rejections are now logged
// Process will exit on uncaught exceptions
```

## Remote Logging

For future expansion, the library provides a remote logging function:

```typescript
import { createRemoteLogger } from '@lyku/logger';

const logger = createRemoteLogger({
	name: 'my-service',
	remoteUrl: 'https://logs.example.com/api/logs',
	batchSize: 100,
	batchIntervalMs: 5000,
});
```

## Dependencies

- `pino` - High-performance logging library
- `pino-pretty` - Pretty printing for development
- `@lyku/clickhouse-client` - ClickHouse integration
