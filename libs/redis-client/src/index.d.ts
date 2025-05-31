import { Redis, type RedisOptions } from 'ioredis';
export declare const createRedisClient: (props?: RedisOptions) => Redis;
export declare const client: Redis;
