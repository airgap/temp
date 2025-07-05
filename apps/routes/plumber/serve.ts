import { flushAll } from './index';
import { RedisLock } from '@lyku/locker';

const FLUSH_INTERVAL_MS = 10000;
const SERVICE_NAME = 'lyku-plumber';

// Wrapper function that uses Redis locking
async function runFlushWithLock() {
	const lock = new RedisLock(SERVICE_NAME, FLUSH_INTERVAL_MS * 2);

	try {
		// Try to acquire lock
		const acquired = await lock.acquire();
		if (!acquired) {
			console.debug('Flush job skipped - another instance is running');
			return;
		}

		console.info('Starting plumber flush job');
		await flushAll();
		console.info('Plumber flush job completed');
	} catch (error) {
		console.error('Plumber flush job failed', { error });
	} finally {
		await lock.release();
	}
}

// Start the periodic flush process
setInterval(runFlushWithLock, FLUSH_INTERVAL_MS);

// Start web server for health checks
Bun.serve({
	port: process.env.PORT || 3000,
	fetch(req) {
		const url = new URL(req.url);

		if (url.pathname === '/health') {
			return new Response(':D', { status: 200 });
		}

		return new Response('Not Found', { status: 404 });
	},
});

console.info('Plumber service started on port', process.env.PORT || 3000);
