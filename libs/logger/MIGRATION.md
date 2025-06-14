# Migration Guide: Upgrading to ClickHouse Logger

This guide helps you migrate from the basic Pino logger to the enhanced ClickHouse-integrated logger in the LYKU ecosystem.

## Overview

The new logger maintains full backward compatibility while adding powerful ClickHouse integration for log analytics, better performance monitoring, and centralized log storage.

## What's New

### ✨ New Features

- **ClickHouse Integration**: Automatic log shipping to ClickHouse for analytics
- **Batch Processing**: Efficient batching for high-throughput logging
- **Enhanced Security**: Improved field redaction with nested object support
- **Transaction Logging**: Built-in patterns for transaction tracing
- **Performance Monitoring**: Built-in performance tracking capabilities
- **Error Aggregation**: Smart error grouping and reporting

### 🔄 Breaking Changes

- **None**: All existing code continues to work without changes
- Package name remains `@lyku/logger` (previously `@lyku/metrics`)

## Migration Steps

### Step 1: Update Dependencies

Your `package.json` should already include the ClickHouse client dependency:

```json
{
	"dependencies": {
		"@lyku/clickhouse-client": "workspace:*"
	}
}
```

### Step 2: Environment Setup

Add ClickHouse environment variables (if using ClickHouse features):

```bash
# .env
CH_ENDPOINT=http://localhost:8123
CH_USERNAME=default
CH_PASSWORD=your_password
```

### Step 3: Initialize ClickHouse (Optional)

If you want to use ClickHouse logging, initialize the table:

```typescript
import { initializeClickHouseLogging } from '@lyku/logger';

// Run once during application startup
await initializeClickHouseLogging('application_logs');
```

### Step 4: Gradual Migration

#### Before (Basic Logger)

```typescript
import { createLogger } from '@lyku/logger';

const logger = createLogger({
	name: 'my-service',
	level: 'info',
});

logger.info('User logged in', { userId: '123' });
```

#### After (ClickHouse Logger)

```typescript
import { createClickHouseLogger } from '@lyku/logger';

const logger = createClickHouseLogger({
	name: 'my-service',
	level: 'info',
	enableClickHouse: true, // Enable ClickHouse logging
	clickHouseTable: 'app_logs', // Specify table name
});

logger.info('User logged in', { userId: '123' });
// Logs to both console AND ClickHouse
```

## Migration Strategies

### Strategy 1: Gradual Rollout (Recommended)

Start by enabling ClickHouse on non-critical services:

```typescript
// Week 1: Enable on development services
const logger = createClickHouseLogger({
	name: 'dev-service',
	enableClickHouse: process.env.NODE_ENV === 'development',
});

// Week 2: Enable on staging
const logger = createClickHouseLogger({
	name: 'staging-service',
	enableClickHouse: ['development', 'staging'].includes(process.env.NODE_ENV),
});

// Week 3: Full production rollout
const logger = createClickHouseLogger({
	name: 'prod-service',
	enableClickHouse: true,
});
```

### Strategy 2: Feature Flag Approach

Use feature flags for controlled rollout:

```typescript
const logger = createClickHouseLogger({
	name: 'my-service',
	enableClickHouse: process.env.ENABLE_CLICKHOUSE_LOGGING === 'true',
	clickHouseBatchSize: 100,
	clickHouseBatchInterval: 5000,
});
```

### Strategy 3: Service-by-Service Migration

Migrate one service at a time:

```typescript
// High-volume services: Larger batches, less frequent flushing
const paymentLogger = createClickHouseLogger({
	name: 'payment-service',
	enableClickHouse: true,
	clickHouseBatchSize: 1000,
	clickHouseBatchInterval: 10000,
});

// Critical services: Smaller batches, more frequent flushing
const authLogger = createClickHouseLogger({
	name: 'auth-service',
	enableClickHouse: true,
	clickHouseBatchSize: 50,
	clickHouseBatchInterval: 2000,
});
```

## Common Migration Patterns

### Pattern 1: Request Logging Migration

#### Before

```typescript
app.use((req, res, next) => {
	logger.info(`${req.method} ${req.url}`, {
		method: req.method,
		url: req.url,
		ip: req.ip,
	});
	next();
});
```

#### After

```typescript
import { requestLogger } from '@lyku/logger';

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

### Pattern 2: Error Handling Migration

#### Before

```typescript
process.on('uncaughtException', (error) => {
	logger.error('Uncaught exception', { error: error.message });
	process.exit(1);
});
```

#### After

```typescript
import { initializeLogging } from '@lyku/logger';

// Automatically sets up error handlers
const logger = initializeLogging({
	name: 'my-service',
	enableClickHouse: true,
});
```

### Pattern 3: Child Logger Migration

#### Before

```typescript
const userLogger = logger.child({ userId: '123' });
userLogger.info('User action', { action: 'login' });
```

#### After

```typescript
// Works exactly the same - no changes needed!
const userLogger = logger.child({ userId: '123' });
userLogger.info('User action', { action: 'login' });
// Now also logs to ClickHouse with user context
```

## Performance Considerations

### Batch Size Tuning

Choose batch sizes based on your service characteristics:

```typescript
// High-throughput service (>1000 logs/minute)
const logger = createClickHouseLogger({
	clickHouseBatchSize: 1000,
	clickHouseBatchInterval: 5000,
});

// Medium-throughput service (100-1000 logs/minute)
const logger = createClickHouseLogger({
	clickHouseBatchSize: 100,
	clickHouseBatchInterval: 5000,
});

// Low-throughput service (<100 logs/minute)
const logger = createClickHouseLogger({
	clickHouseBatchSize: 50,
	clickHouseBatchInterval: 10000,
});
```

### Memory Usage

Monitor memory usage when enabling ClickHouse logging:

```typescript
// Monitor batch queue size
const logger = createClickHouseLogger({
	enableClickHouse: true,
	clickHouseBatchSize: 500, // Adjust based on memory constraints
});

// Add memory monitoring
setInterval(() => {
	const usage = process.memoryUsage();
	logger.debug('Memory usage', {
		heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
		heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
		external: Math.round(usage.external / 1024 / 1024),
	});
}, 60000);
```

## Rollback Plan

If you need to rollback, simply switch back to basic logger:

```typescript
// Emergency rollback - disable ClickHouse
const logger = createClickHouseLogger({
	name: 'my-service',
	enableClickHouse: false, // Quick disable
});

// Or use basic logger
import { createLogger } from '@lyku/logger';
const logger = createLogger({
	name: 'my-service',
	level: 'info',
});
```

## Testing Your Migration

### 1. Verify ClickHouse Connection

```typescript
import { createClickhouseClient } from '@lyku/clickhouse-client';

async function testConnection() {
	try {
		const client = createClickhouseClient();
		await client.ping();
		console.log('✓ ClickHouse connection successful');
	} catch (error) {
		console.error('✗ ClickHouse connection failed:', error);
	}
}
```

### 2. Test Log Insertion

```typescript
const logger = createClickHouseLogger({
	name: 'test-service',
	enableClickHouse: true,
	clickHouseTable: 'test_logs',
	clickHouseBatchSize: 1, // Force immediate flush
	clickHouseBatchInterval: 100,
});

logger.info('Test log entry', { testId: Date.now() });

// Wait and check ClickHouse
setTimeout(async () => {
	const client = createClickhouseClient();
	const result = await client.query({
		query: 'SELECT * FROM test_logs ORDER BY timestamp DESC LIMIT 1',
	});
	console.log('Latest log entry:', await result.json());
}, 1000);
```

### 3. Load Testing

```typescript
// Simulate high-volume logging
const logger = createClickHouseLogger({
	name: 'load-test',
	enableClickHouse: true,
});

for (let i = 0; i < 10000; i++) {
	logger.info(`Load test message ${i}`, {
		iteration: i,
		timestamp: Date.now(),
	});
}
```

## Monitoring and Alerting

Set up monitoring for your ClickHouse logging:

### 1. ClickHouse Query Monitoring

```sql
-- Monitor log ingestion rate
SELECT
  toStartOfMinute(timestamp) as minute,
  count() as log_count,
  uniq(service) as unique_services
FROM application_logs
WHERE timestamp >= now() - INTERVAL 1 HOUR
GROUP BY minute
ORDER BY minute DESC;

-- Monitor error rates
SELECT
  service,
  level,
  count() as count
FROM application_logs
WHERE timestamp >= now() - INTERVAL 1 HOUR
  AND level IN ('error', 'fatal')
GROUP BY service, level
ORDER BY count DESC;
```

### 2. Application Monitoring

```typescript
// Monitor batch queue health
const logger = createClickHouseLogger({
	name: 'monitored-service',
	enableClickHouse: true,
});

// Add health check endpoint
app.get('/health/logging', (req, res) => {
	// Check if logger is functioning
	logger.debug('Health check ping');
	res.json({
		status: 'ok',
		clickhouse_enabled: true,
		timestamp: new Date().toISOString(),
	});
});
```

## Troubleshooting

### Common Issues

#### 1. ClickHouse Connection Errors

```typescript
// Add connection retry logic
const logger = createClickHouseLogger({
	name: 'resilient-service',
	enableClickHouse: true,
	// Logs will fall back to console-only if ClickHouse fails
});

// Monitor connection health
logger.info('Service started', { clickhouse_enabled: true });
```

#### 2. High Memory Usage

```typescript
// Reduce batch sizes
const logger = createClickHouseLogger({
	clickHouseBatchSize: 50, // Smaller batches
	clickHouseBatchInterval: 2000, // More frequent flushing
});
```

#### 3. Slow Performance

```typescript
// Optimize for performance
const logger = createClickHouseLogger({
	clickHouseBatchSize: 1000, // Larger batches
	clickHouseBatchInterval: 10000, // Less frequent flushing
	level: 'info', // Reduce debug logs
});
```

## Next Steps

After successful migration:

1. **Set up ClickHouse dashboards** for log analytics
2. **Configure alerts** for error patterns
3. **Implement log retention policies**
4. **Train team** on new logging capabilities
5. **Optimize performance** based on usage patterns

## Support

For migration assistance:

- Check the [examples directory](./examples/) for usage patterns
- Review the [README.md](./README.md) for detailed API documentation
- Test with the provided [test script](./test-clickhouse.ts)

---

**Migration Checklist:**

- [ ] Environment variables configured
- [ ] ClickHouse table initialized
- [ ] Test service migrated successfully
- [ ] Performance metrics baseline established
- [ ] Monitoring and alerting configured
- [ ] Team trained on new features
- [ ] Rollback plan documented
- [ ] Production migration scheduled
