import type { Database } from '@lyku/db-config/kysely';
import type { Post, User } from '@lyku/json-models';
import type { Kysely } from 'kysely';

export const getLikesForPosts = (
	db: Kysely<Database>,
	posts: bigint[],
	user?: bigint,
) =>
	user && posts.length
		? db
				.selectFrom('likes')
				.where('postId', 'in', posts)
				.where('userId', '=', user)
				.select('postId')
				.execute()
				.then((posts) => posts.map((post) => post.postId))
		: [];
