import type { Database } from '@lyku/db-types';
import type { Kysely } from 'kysely';
import { getLikesForPosts } from './getLikesForPosts.server';
import type RedisClient from '../../RedisClient';
import type { RedisClientType } from 'redis';

export const getLikeVectors = async (
	db: Kysely<Database>,
	redis: RedisClient,
	posts: bigint[],
	user?: bigint,
) => {
	if (!user) return [];
	const rawLikes = new Set(await getLikesForPosts(db, redis, posts, user));
	return posts.map((p) => (rawLikes.has(p) ? p : -p));
};
