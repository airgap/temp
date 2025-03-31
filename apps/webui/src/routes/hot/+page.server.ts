// import type { PageLoad } from './$types';
import { neon } from '../../lib/server/db.server';
import { queryHotPosts } from './getHotPosts.server';
import { ELASTIC_API_ENDPOINT, ELASTIC_API_KEY } from '$env/static/private';
export const load = async ({ params, fetch, parent }) => {
	const { user } = await parent();
	const db = neon();
	const { posts, continuation } = await queryHotPosts({
		fetch,
		ELASTIC_API_ENDPOINT,
		ELASTIC_API_KEY,
	});

	const authors = await db
		.selectFrom('users')
		.where('id', 'in', [...new Set(posts.map((p) => p.author))])
		.selectAll()
		.execute();
	const likes = user
		? await db
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
	// const likemap = likes.reduce((o,l)=>({...o, [l.postId]}))
	// console.log('OY M8 WE GOT LIKES', )
	return {
		posts,
		continuation,
		users: authors,
		likes: posts.map((p) =>
			likes.some((l) => l.postId === p.id) ? p.id : -p.id,
		),
	};
};
