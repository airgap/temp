// import type { PageLoad } from './$types';
import { neon, getUsers, getLikesForPosts } from '../../../lib/server';
export const load = async ({ params, fetch, parent }) => {
	const { user } = await parent();
	const { slug } = params;
	const db = neon();
	const target = slug
		? await db
				.selectFrom('users')
				.selectAll()
				.where('slug', '=', slug.toLocaleLowerCase())
				.executeTakeFirst()
		: undefined;

	const posts = target
		? await db
				.selectFrom('posts')
				.selectAll()
				.where('author', '=', target.id)
				.orderBy('publish', 'desc')
				.execute()
		: [];

	const authors = posts?.length
		? await getUsers(
				db,
				posts.map((p) => p.id),
			)
		: [];
	const rawFollows = await db
		.selectFrom('userFollows')
		.select('followee')
		.where('follower', '=', user.id)
		.where(
			'followee',
			'in',
			authors.map((a) => a.id),
		)
		.execute();
	const followVectors = authors.map((a) =>
		rawFollows.some((f) => f.followee === a.id) ? a.id : -a.id,
	);
	const rawLikes = await getLikesForPosts(
		db,
		posts.map((p) => p.id),
		user,
	);
	const likeVectors = posts.map((p) =>
		rawLikes.some((l) => l === p.id) ? p.id : -p.id,
	);
	// const likemap = likes.reduce((o,l)=>({...o, [l.postId]}))
	// console.log('OY M8 WE GOT LIKES', )
	return {
		posts,
		users: authors,
		likes: likeVectors,
		follows: followVectors,
		target,
	};
};
