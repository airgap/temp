import * as env from '$env/static/private';
import RedisClient from './RedisClient';
export const initRedis = () =>
	new RedisClient({
		url: env.REDIS_URL || 'redis://localhost:6379',
		password: env.REDIS_PASSWORD,
		database: 0,
		timeout: 5000,
	});
