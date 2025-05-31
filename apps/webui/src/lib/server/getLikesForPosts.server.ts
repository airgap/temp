import type { Database } from '@lyku/db-config/kysely';
import type { Kysely } from 'kysely';
import type RedisClient from '../../RedisClient';
// import { defaultLogger as logger } from '@lyku/logger';
const logger = console;
export const getLikesForPosts = async (
	db: Kysely<Database>,
	redis: RedisClient,
	posts: bigint[],
	user?: bigint,
) => {
	if (!user || posts.length === 0) {
		return [];
	}

	logger.debug('Getting likes for posts', {
		userId: user.toString(),
		postCount: posts.length,
	});

	// Prepare results array
	const likedPostIds: bigint[] = [];
	const postsToCheckInDb: bigint[] = [];

	// Try to get user's reactions from Redis first
	const userShardId = Number(user % 100n);
	const userReactionsKey = `user:${userShardId}:${user}:reactions`;

	try {
		// Check if user's reactions key exists in Redis
		const exists = await redis.exists(userReactionsKey);

		if (exists) {
			// Get all reactions for this user in one batch
			const userReactions = (await redis.hgetall(userReactionsKey)) || {};

			// Process each post to see if user has reacted to it
			for (const postId of posts) {
				const postIdStr = postId.toString();

				if (postIdStr in userReactions) {
					// User has a reaction for this post
					if (userReactions[postIdStr] !== '') {
						likedPostIds.push(postId);
					}
				} else {
					// Check if post reactions exist in Redis
					const postShardId = Number(postId % 100n);
					const postReactionsKey = `post:${postShardId}:${postId}:reactions`;
					const reactionsExist = await redis.exists(postReactionsKey);

					if (!reactionsExist) {
						// If post reactions aren't in Redis (expired or evicted), check DB
						postsToCheckInDb.push(postId);
					} else {
						// Check if this is a viral post
						const viralFlagKey = `post:${postShardId}:${postId}:viral`;
						const isViral = await redis.exists(viralFlagKey);

						if (isViral) {
							// For viral posts, if not in user's cache, need to check DB
							postsToCheckInDb.push(postId);
						}
						// For regular posts with reactions in Redis, but user not in cache,
						// the user hasn't reacted - no action needed
					}
				}
			}
		} else {
			// If user reactions aren't cached at all, fall back to DB for all posts
			postsToCheckInDb.push(...posts);
		}

		// For any posts we need to check in DB (viral or uncached)
		if (postsToCheckInDb.length > 0) {
			logger.debug('Falling back to DB for some posts', {
				count: postsToCheckInDb.length,
			});

			const dbLikes = await db
				.selectFrom('likes')
				.where('postId', 'in', postsToCheckInDb)
				.where('userId', '=', user)
				.select('postId')
				.execute();

			// Add DB results to our list
			for (const like of dbLikes) {
				likedPostIds.push(like.postId);

				// Update Redis cache for this reaction for future queries
				try {
					const postId = like.postId;
					const postShardId = Number(postId % 100n);
					const postReactionsKey = `post:${postShardId}:${postId}:reactions`;

					// Only update the cache if the reactions key exists
					const reactionsExist = await redis.exists(postReactionsKey);
					if (reactionsExist) {
						// Update user's reaction in post hash
						await redis.hset(postReactionsKey, user.toString(), 'like');
						// Update user's reactions hash
						await redis.hset(userReactionsKey, postId.toString(), 'like');
					}
				} catch (redisError) {
					// Non-critical error, just log and continue
					logger.error('Failed to update Redis cache for reaction', {
						error: redisError,
						userId: user,
						postId: like.postId,
					});
				}
			}
		}

		return likedPostIds;
	} catch (redisError) {
		// If Redis fails, fall back completely to database
		logger.error('Redis operation failed in getLikesForPosts', {
			error: redisError,
			userId: user,
		});

		// Fall back to direct DB query for all posts
		return db
			.selectFrom('likes')
			.where('postId', 'in', posts)
			.where('userId', '=', user)
			.select('postId')
			.execute()
			.then((likes) => likes.map((post: { postId: bigint }) => post.postId));
	}
};
