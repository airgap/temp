import type { Database } from '@lyku/db-types';
import type { Kysely } from 'kysely';
import type RedisClient from '../../RedisClient';

export const getReactions = async (
	db: Kysely<Database>,
	redis: RedisClient,
	posts: bigint[],
	user?: bigint,
) => {
	if (!(posts.length && user)) return new Map();

	// Try to get users from Redis cache first
	const postIdStrings = posts.map((id) => id.toString());
	const reactions = await redis.hmget(
		`user:${user}:reactions`,
		...postIdStrings,
	);

	// Process cache results
	const result = new Map<bigint, string>();
	const missingPostIds: bigint[] = [];

	// Map of user ID to its position in the original array to maintain order
	// const postPositions = new Map<string, number>();
	// postIdStrings.forEach((id, index) => postPositions.set(id, index));

	// Process each post, tracking which ones we got from cache and which ones are missing
	for (let i = 0; i < posts.length; i++) {
		const postId = posts[i];
		const postIdString = postIdStrings[i];
		const cachedReaction = reactions[i];

		if (cachedReaction) {
			// Add user from cache
			result.set(postId, cachedReaction);
		} else {
			// Mark this position as needing to be filled from DB
			missingPostIds.push(postId);
		}
	}

	// If we have missing users, fetch them from the database
	if (missingPostIds.length > 0) {
		const dbReactions = await db
			.selectFrom('reactions')
			.where('userId', '=', user)
			.where('postId', 'in', missingPostIds)
			.select(['postId', 'type'])
			.execute();

		// Add database users to result array and update cache
		const cacheUpdates: string[] = [];

		for (const { postId, type } of dbReactions) {
			const userIdStr = postId.toString();

			// Find position in the original array
			// const position = postPositions.get(userIdStr);
			// if (position !== undefined) {
			result.set(postId, type);
			// }

			// Add to cache update batch
			cacheUpdates.push(userIdStr, type);
		}

		// Update cache with missing users if we found any
		if (cacheUpdates.length > 1) {
			try {
				await redis.hset('users', ...cacheUpdates);
			} catch (error) {
				console.error('Failed to update user cache', error);
				// Non-critical error, continue with results
			}
		}
	}

	// Remove any null placeholders (in case some users weren't found in DB either)
	return result;
};
