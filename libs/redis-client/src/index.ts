import { Redis, RedisOptions } from 'ioredis';

const endpoint = process.env['REDIS_ENDPOINT'];
if (!endpoint) throw new Error('REDIS_ENDPOINT not set!');
export const createRedisClient = (props: RedisOptions = {}) =>
	new Redis(endpoint, {
		...props,
		password: process.env['REDIS_PASSWORD'],
		username: process.env['REDIS_USERNAME'],
	});
export const client = createRedisClient();
