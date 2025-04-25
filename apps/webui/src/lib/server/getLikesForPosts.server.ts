import type { Database } from '@lyku/db-config/kysely';
import type { Kysely } from 'kysely';

export const getLikesForPosts = async (
	db: Kysely<Database>,
	posts: bigint[],
	user?: bigint,
) => {
	console.log(
		'glikes',
		typeof user,
		posts.map((p) => p.toLocaleString()),
	);
	const res =
		user && posts.length
			? await db
					.selectFrom('likes')
					.where('postId', 'in', posts)
					.where('userId', '=', user)
					.select('postId')
					.execute()
					.then((likes) => likes.map((post) => post.postId))
			: [];
	return res;
};
