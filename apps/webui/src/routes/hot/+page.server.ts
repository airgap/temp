// import type { PageLoad } from './$types';
import { neon } from '../../lib/server/db.server';
import { queryHotPosts } from './getHotPosts.server';
import { ELASTIC_API_ENDPOINT, ELASTIC_API_KEY } from '$env/static/private';
import { getAuthorsForPosts } from '../getAuthorsForPosts';
import { getLikesForPosts } from '../getLikesForPosts';
export const load = async ({ params, fetch, parent }) => {
	const { user } = await parent();
	const db = neon();
	const { posts, continuation } = await queryHotPosts({
		fetch,
		ELASTIC_API_ENDPOINT,
		ELASTIC_API_KEY,
	});

	const authors = await getAuthorsForPosts(posts, db);
	const rawLikes = await getLikesForPosts(db, posts, user);
	const likeVectors = posts.map((p) =>
		rawLikes.some((l) => l.postId === p.id) ? p.id : -p.id,
	);
	// const likemap = likes.reduce((o,l)=>({...o, [l.postId]}))
	// console.log('OY M8 WE GOT LIKES', )
	return {
		posts,
		continuation,
		users: authors,
		likes: likeVectors,
	};
};
