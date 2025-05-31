import type { Database } from '@lyku/db-config/kysely';
import type { Kysely } from 'kysely';
import type RedisClient from '../../RedisClient';
import type { RedisClientType } from 'redis';
import { parseBON } from 'from-schema';

export const getUsers = async (
	db: Kysely<Database>,
	redis: RedisClient,
	users: bigint[],
) => {
	if (!users.length) return [];
	console.log('ass');
	// Try to get users from Redis cache first
	const userIds = users.map((id) => id.toString());
	const userStrings = await redis.hmget(`users`, ...userIds);
	console.log('fuck');
	// Process cache results
	const result = [];
	const missingUserIds: bigint[] = [];

	// Map of user ID to its position in the original array to maintain order
	const userPositions = new Map<string, number>();
	userIds.forEach((id, index) => userPositions.set(id, index));

	// Process each user, tracking which ones we got from cache and which ones are missing
	for (let i = 0; i < users.length; i++) {
		const userId = users[i];
		const userIdStr = userIds[i];
		const cachedUser = userStrings[i];

		if (typeof cachedUser === 'string') {
			// Add user from cache
			result[i] = parseBON(cachedUser);
		} else {
			// Mark this position as needing to be filled from DB
			missingUserIds.push(userId);
			result[i] = null; // Placeholder to maintain position
		}
	}

	// If we have missing users, fetch them from the database
	if (missingUserIds.length > 0) {
		const dbUsers = await db
			.selectFrom('users')
			.where('id', 'in', missingUserIds)
			.selectAll()
			.execute();

		// Add database users to result array and update cache
		const cacheUpdates: string[] = [];

		for (const dbUser of dbUsers) {
			const userId = dbUser.id;
			const userIdStr = userId.toString();
			const userJson = JSON.stringify(dbUser);

			// Find position in the original array
			const position = userPositions.get(userIdStr);
			if (position !== undefined) {
				result[position] = dbUser;
			}

			// Add to cache update batch
			cacheUpdates.push(userIdStr, userJson);
		}

		// Update cache with missing users if we found any
		if (cacheUpdates.length > 0) {
			try {
				// await redis.hSet('users', cacheUpdates);
			} catch (error) {
				console.error('Failed to update user cache', error);
				// Non-critical error, continue with results
			}
		}
	}

	// Remove any null placeholders (in case some users weren't found in DB either)
	return result.filter(Boolean);
};
