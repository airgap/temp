import type { Database } from '@lyku/db-config/kysely';
import type { Kysely } from 'kysely';
import { getLikesForPosts } from './routes/getLikesForPosts';

export const getLikeVectors = async (
	user: bigint,
	posts: bigint[],
	db: Kysely<Database>,
) => {
	console.log(
		'Getting likes for posts',
		posts.map((p) => typeof p),
	);
	const rawLikes = new Set(await getLikesForPosts(db, posts, user));
	console.log('Got likes', rawLikes.size);
	return posts.map((p) => (rawLikes.has(p) ? p : -p));
};
