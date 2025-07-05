# @lyku/locker

Redis-based distributed locking library for preventing replica interference in services.

## Features

- Redis-based distributed locks with TTL expiration
- Automatic lock refresh to maintain ownership during long operations
- Proper cleanup on completion or service shutdown
- TypeScript support

## Usage

```typescript
import { RedisLock } from '@lyku/locker';

const lock = new RedisLock('my-service', 60000); // 60 second TTL

try {
	const acquired = await lock.acquire();
	if (!acquired) {
		console.log('Another instance is running');
		return;
	}

	// Do work here
	await doWork();
} finally {
	await lock.release();
}
```

## Lock Behavior

- Only one process can hold a lock at a time
- Locks automatically expire after the specified TTL
- Lock refresh happens at half the TTL interval
- Failed acquisitions are silent (return false)
- Proper cleanup prevents lock leakage
