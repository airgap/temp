import { Redis, type RedisOptions } from 'ioredis';

const endpoint = process.env['REDIS_CONNECTION_STRING'];
if (!endpoint) throw new Error('REDIS_CONNECTION_STRING not set!');
export const createRedisClient = (props: RedisOptions = {}) =>
	new Redis(endpoint, {
		...props,
		password: process.env['REDIS_PASSWORD'],
		username: process.env['REDIS_USERNAME'],
	});
export const client = createRedisClient();
