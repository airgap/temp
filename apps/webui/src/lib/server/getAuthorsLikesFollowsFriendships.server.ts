import { getUsers } from './getUsers.server';
import { dedupe } from '@lyku/helpers';
import { getFollowVectors } from './getFollowVectors.server';
import { getFriendshipStatuses } from './getFriendshipStatuses.server';
import { getLikeVectors } from './getLikeVectors.server';
import type { Kysely } from 'kysely';
import type { Database } from '@lyku/db-config/kysely';
import type { Post } from '@lyku/json-models';
import type RedisClient from '../../RedisClient';
export const getAuthorsLikesFollowsFriendships = async (
	db: Kysely<Database>,
	redis: RedisClient,
	posts: Post[],
	user?: bigint,
) => {
	const postIds = posts.map((p) => p.id);
	const authorIds = dedupe(posts.map((p) => p.author));
	return {
		users: getUsers(db, redis, authorIds),
		likes: getLikeVectors(db, redis, postIds, user),
		follows: getFollowVectors(db, authorIds, user),
		friendships: getFriendshipStatuses(db, authorIds, user),
	};
};
