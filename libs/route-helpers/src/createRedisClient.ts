import { createClient } from 'redis';

export const createRedisClient = () =>
	createClient({
		url: process.env['REDIS_ENDPOINT'],
		password: process.env['REDIS_PASSWORD'],
		username: process.env['REDIS_USERNAME'],
	});
