// import type { PageLoad } from './$types';
import { neon } from '../../lib/server/db.server';
import { queryHotPosts } from './getHotPosts.server';
import { ELASTIC_API_ENDPOINT, ELASTIC_API_KEY } from '$env/static/private';
import { getAuthors } from '../getUsers';
import { getLikesForPosts } from '../getLikesForPosts';
import { bondIds, dedupe } from '@lyku/helpers';
import type {
	FriendRequest,
	Friendship,
	FriendshipStatus,
} from '@lyku/json-models';
import { dedupeAuthorIds } from '../getDedupedAuthorIds';
import { getFollowVectors } from '../../getFollowVectors.server';
import { getFriendshipStatuses } from '../../getFriendshipStatuses.server';
import { getLikeVectors } from '../../getLikeVectors.server';
export const load = async ({ params, fetch, parent }) => {
	const { user } = await parent();
	const db = neon();
	const { posts, continuation } = await queryHotPosts({
		fetch,
		ELASTIC_API_ENDPOINT,
		ELASTIC_API_KEY,
	});
	const postIds = posts.map((p) => p.id);
	const authorIds = dedupe(posts.map((p) => p.author));
	return {
		posts,
		continuation,
		users: getAuthors(authorIds, db),
		likes: getLikeVectors(user, postIds, db),
		follows: getFollowVectors(user.id, authorIds, db),
		friendships: getFriendshipStatuses(user, authorIds, db),
	};
};
