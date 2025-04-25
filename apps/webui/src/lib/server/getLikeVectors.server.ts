import type { Database } from '@lyku/db-config/kysely';
import type { Kysely } from 'kysely';
import { getLikesForPosts } from './getLikesForPosts.server';

export const getLikeVectors = async (
	db: Kysely<Database>,
	posts: bigint[],
	user?: bigint,
) => {
	if (!user) return [];
	const rawLikes = new Set(await getLikesForPosts(db, posts, user));
	return posts.map((p) => (rawLikes.has(p) ? p : -p));
};
