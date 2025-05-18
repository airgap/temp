import RedisClient from './redis-client.js';

// Example Cloudflare Worker that uses our custom Redis client
export default {
	async fetch(request, env, ctx) {
		try {
			// Create a Redis client instance
			const redis = new RedisClient({
				url: env.REDIS_URL || 'redis://localhost:6379',
				password: env.REDIS_PASSWORD,
				database: 0,
				timeout: 5000,
			});

			const url = new URL(request.url);
			const path = url.pathname;

			// Simple router for different operations
			if (path === '/increment') {
				// Increment a counter
				const key = 'visitor_count';
				const count = await redis.incr(key);
				return new Response(`Visitor count: ${count}`, {
					headers: { 'Content-Type': 'text/plain' },
				});
			} else if (path === '/set') {
				// Extract key and value from query parameters
				const key = url.searchParams.get('key');
				const value = url.searchParams.get('value');

				if (!key || !value) {
					return new Response('Missing key or value parameters', {
						status: 400,
					});
				}

				await redis.set(key, value);
				return new Response(`Set ${key} to ${value}`, {
					headers: { 'Content-Type': 'text/plain' },
				});
			} else if (path === '/get') {
				// Get a value by key
				const key = url.searchParams.get('key');

				if (!key) {
					return new Response('Missing key parameter', {
						status: 400,
					});
				}

				const value = await redis.get(key);
				return new Response(`${key} = ${value}`, {
					headers: { 'Content-Type': 'text/plain' },
				});
			} else if (path === '/hash') {
				// Example of hash operations
				const action = url.searchParams.get('action');
				const key = url.searchParams.get('key');
				const field = url.searchParams.get('field');
				const value = url.searchParams.get('value');

				if (!key || !action) {
					return new Response('Missing key or action parameters', {
						status: 400,
					});
				}

				if (action === 'set' && field && value) {
					await redis.hset(key, field, value);
					return new Response(`Set ${field}=${value} in hash ${key}`, {
						headers: { 'Content-Type': 'text/plain' },
					});
				} else if (action === 'get' && field) {
					const fieldValue = await redis.hget(key, field);
					return new Response(`${key}.${field} = ${fieldValue}`, {
						headers: { 'Content-Type': 'text/plain' },
					});
				} else if (action === 'getall') {
					const allValues = await redis.hgetall(key);
					return new Response(JSON.stringify(allValues, null, 2), {
						headers: { 'Content-Type': 'application/json' },
					});
				}
			}

			// Default route - just ping Redis
			const pong = await redis.ping();
			return new Response(`Redis is alive: ${pong}`, {
				headers: { 'Content-Type': 'text/plain' },
			});
		} catch (error) {
			return new Response(`Error: ${error.message}`, {
				status: 500,
				headers: { 'Content-Type': 'text/plain' },
			});
		}
	},
};
