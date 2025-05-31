import * as env from '$env/static/private';
import RedisClient from './RedisClient';
console.log(
	'REDIS_EXTERNAL_CONNECTION_STRING',
	env.REDIS_EXTERNAL_CONNECTION_STRING,
);
export const initRedis = () =>
	new RedisClient({
		url: env.REDIS_EXTERNAL_CONNECTION_STRING,
		// password: env.REDIS_PASSWORD,
		database: 0,
		timeout: 5000,
	});
