import { reindexPosts } from './reindex-elastic';
import { RedisLock } from '@lyku/locker';

const SERVICE_NAME = 'lyku-indy';
const REINDEX_LOCK_TTL_MS = 60 * 60 * 1000; // 1 hour

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

console.info('Indy service started on port', process.env.PORT || 3000);

// Start the reindex process with locking
async function runReindexWithLock() {
	const lock = new RedisLock(SERVICE_NAME, REINDEX_LOCK_TTL_MS);

	try {
		// Try to acquire lock
		const acquired = await lock.acquire();
		if (!acquired) {
			console.info('Reindex skipped - another instance is already running');
			return;
		}

		console.info('Starting reindex process');
		await reindexPosts();
		console.log('Reindex completed successfully');
		// Keep the process running for health checks
	} catch (error) {
		console.error('Fatal error during reindex:', error);
		process.exit(1);
	} finally {
		await lock.release();
	}
}

runReindexWithLock();
