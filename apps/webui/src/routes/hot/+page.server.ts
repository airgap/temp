// import type { PageLoad } from './$types';
import {
	neon,
	getUsers,
	getFollowVectors,
	getFriendshipStatuses,
	getLikeVectors,
} from '../../lib/server';
import { queryHotPosts } from './getHotPosts.server';
import { ELASTIC_API_ENDPOINT, ELASTIC_API_KEY } from '$env/static/private';
import { dedupe } from '@lyku/helpers';
export const load = async ({ params, fetch, parent }) => {
	console.log('Loading /hot for');
	const { user } = await parent();
	console.log('Username:', user?.username);
	const db = neon();
	console.log('Querying neon');
	const { posts, continuation } = await queryHotPosts({
		fetch,
		ELASTIC_API_ENDPOINT,
		ELASTIC_API_KEY,
	});
	console.log('Got posts');
	const postIds = posts.map((p) => p.id);
	const authorIds = dedupe(posts.map((p) => p.author));
	console.log('Returning everything');
	return {
		order: postIds,
		posts,
		continuation,
		users: getUsers(db, authorIds),
		likes: getLikeVectors(db, postIds, user?.id),
		follows: getFollowVectors(db, authorIds, user?.id),
		friendships: getFriendshipStatuses(db, authorIds, user?.id),
	};
};
