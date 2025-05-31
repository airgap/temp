import { Redis, type RedisOptions } from 'ioredis';

const endpoint = process.env['REDIS_INTERNAL_CONNECTION_STRING'];
if (!endpoint) throw new Error('REDIS_INTERNAL_CONNECTION_STRING not set!');
console.log('Redis endpoint:', endpoint);
console.log('Redis username:', process.env['REDIS_USERNAME']);
console.log('Redis password:', process.env['REDIS_PASSWORD']);
export const createRedisClient = (props: RedisOptions = {}) =>
	new Redis(endpoint, {
		...props,
		// password: process.env['REDIS_PASSWORD'],
		// username: process.env['REDIS_USERNAME'],
	});
export const client = createRedisClient();
