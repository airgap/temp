import type { Database } from '@lyku/db-config/kysely';
import type { Post, User } from '@lyku/json-models';
import type { Kysely } from 'kysely';

export const getLikesForPosts = (
	db: Kysely<Database>,
	posts: Post[],
	user?: User,
) =>
	user && posts.length
		? db
				.selectFrom('likes')
				.where(
					'postId',
					'in',
					posts.map((p) => p.id),
				)
				.where('userId', '=', user.id)
				.select('postId')
				.execute()
		: [];
