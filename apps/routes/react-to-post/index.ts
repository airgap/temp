import { handleReactToPost } from '@lyku/handles';
import { bigintToBase58, Err, reactionWorth } from '@lyku/helpers';
import { Kysely, sql } from 'kysely';
import { grantPointsToUser, sendNotification } from '@lyku/route-helpers';
import { Database } from '@lyku/db-config/kysely';
import { Reaction } from '@lyku/json-models';

// Add a retry queue system
import { addToRetryQueue } from '@lyku/queue-system';

// Constants for configuration
const REDIS_PERSISTENCE_RETRY_QUEUE = 'redis:persistence:retry';
const MAX_RETRY_ATTEMPTS = 3;

export default handleReactToPost(
	async (
		{ postId, type },
		{ requester, db, clickhouse, now, redis, logger },
	) => {
		try {
			// 1. First check if post exists - this is still necessary but can be cached
			const postCacheKey = `post:${postId}:exists`;
			let postExists = await redis.get(postCacheKey);

			if (postExists === null) {
				// Only hit the database if we don't have it cached
				const post = await db
					.selectFrom('posts')
					.select(['id', 'author']) // Only select what we need
					.where('id', '=', postId)
					.executeTakeFirst();

				if (!post) throw new Err(404, "Post doesn't exist");
				postExists = JSON.stringify({ id: post.id, author: post.author });

				// Cache the existence check with expiration
				await redis.set(postCacheKey, postExists, 'EX', 3600); // 1 hour cache
			}

			const post = JSON.parse(postExists);

			if (post.author === requester) {
				throw new Err(403, 'You cannot like your own post');
			}

			// 2. Sharded Redis key - for better distribution across Redis cluster
			const userShardId = Number(requester % 100n); // Simple sharding by user ID
			const postShardId = Number(postId % 100n); // Simple sharding by post ID

			const postReactionsKey = `post:${postShardId}:${postId}:reactions`;
			const userReactionsKey = `user:${userShardId}:${requester}:reactions`;
			const reactionCountsKey = `post:${postShardId}:${postId}:reaction_counts`;

			// 3. Improved Redis Lua script with better error handling
			const luaScript = `
        -- Get previous reaction
        local previousReaction = redis.call('HGET', KEYS[1], ARGV[1])

        -- If there was a previous reaction, decrement its count
        if previousReaction then
          redis.call('HINCRBY', KEYS[3], previousReaction, -1)
        end

        -- If adding a new reaction
        if ARGV[2] ~= '' then
          -- Set new reaction
          redis.call('HSET', KEYS[1], ARGV[1], ARGV[2])
          redis.call('HSET', KEYS[2], ARGV[3], ARGV[2])

          -- Increment count
          redis.call('HINCRBY', KEYS[3], ARGV[2], 1)
        else
          -- Remove reaction
          redis.call('HDEL', KEYS[1], ARGV[1])
          redis.call('HDEL', KEYS[2], ARGV[3])
        end

        return previousReaction
      `;

			// Execute the script atomically with proper error handling
			let previousReaction: Reaction | undefined;
			try {
				previousReaction = (await redis.eval(
					luaScript,
					3, // Number of keys
					postReactionsKey, // KEYS[1]
					userReactionsKey, // KEYS[2]
					reactionCountsKey, // KEYS[3]
					requester.toString(), // ARGV[1]
					type || '', // ARGV[2]
					postId.toString(), // ARGV[3]
				)) as Reaction | undefined;
			} catch (redisError) {
				logger.error('Redis reaction operation failed', {
					error: redisError,
					postId,
					userId: requester,
				});
				// Fall back to direct DB if Redis fails
				previousReaction = await getFallbackReaction(db, requester, postId);
			}

			// 4. More robust persistence with retries
			try {
				await persistReactionToPostgres(
					db,
					requester,
					postId,
					type,
					previousReaction,
				);
			} catch (dbError) {
				logger.error('Failed to persist reaction to Postgres', {
					error: dbError,
					postId,
					userId: requester,
				});

				// Add to retry queue instead of just logging
				await addToRetryQueue(REDIS_PERSISTENCE_RETRY_QUEUE, {
					operation: 'persistReactionToPostgres',
					params: {
						userId: requester,
						postId,
						newReaction: type,
						oldReaction: previousReaction,
					},
					attempts: 0,
					maxAttempts: MAX_RETRY_ATTEMPTS,
				});
			}

			// 5. ClickHouse operations in try/catch
			try {
				await clickhouse.insert({
					table: 'user_post_reactions_toilet',
					values: [
						{
							userId: requester,
							postId: postId,
							reaction: type,
							created: now,
							updated: now,
						},
					],
				});
			} catch (chError) {
				logger.error('ClickHouse insert failed', {
					error: chError,
					postId,
					userId: requester,
				});
				// ClickHouse errors are less critical - we can tolerate some loss here
			}

			// 6. Point allocation with better error handling
			if (post.author !== requester && type) {
				try {
					await clickhouse.insert({
						table: 'user_point_grants_toilet',
						values: [
							{
								userId: post.author,
								reason: 'post_reacted',
								key: `${requester}-${post.id}`,
								points: reactionWorth(type),
								created: now,
								updated: now,
							},
						],
					});
				} catch (pointsError) {
					logger.error('Failed to grant points for reaction', {
						error: pointsError,
						postId,
						authorId: post.author,
						userId: requester,
					});
					// Points can be reconciled later through analytics
				}
			}

			// 7. Return object with success status and reaction information
			return {
				success: true,
				postId,
				newReaction: type,
				previousReaction,
			};
		} catch (error) {
			logger.error('Reaction handler failed', {
				error,
				postId,
				userId: requester,
			});
			throw error; // Re-throw to be handled by the API framework
		}
	},
);

// Helper to get reaction from DB if Redis fails
async function getFallbackReaction(
	db: Kysely<Database>,
	userId: bigint,
	postId: bigint,
): Promise<Reaction | undefined> {
	const existingReaction = await db
		.selectFrom('reactions')
		.select(['type'])
		.where('userId', '=', userId)
		.where('postId', '=', postId)
		.executeTakeFirst();

	return existingReaction?.type;
}

// Improved persistence function with proper parameter naming
async function persistReactionToPostgres(
	db: Kysely<Database>,
	userId: bigint,
	postId: bigint,
	newReaction: string,
	oldReaction: string,
) {
	if (!newReaction) {
		// Delete the reaction
		await db
			.deleteFrom('reactions')
			.where('userId', '=', userId)
			.where('postId', '=', postId)
			.execute();
	} else {
		// Use upsert pattern for handling both inserts and updates
		await db
			.insertInto('reactions')
			.values({
				userId,
				postId,
				type: newReaction, // Fixed parameter name
				created: new Date(),
				updated: new Date(),
			})
			.onConflict((oc) =>
				oc.columns(['userId', 'postId']).doUpdateSet({
					type: newReaction,
					updated: new Date(),
				}),
			)
			.execute();
	}
}

// Background job to reconcile Redis with PostgreSQL
// This would be called by a scheduler periodically
export async function reconcileRedisWithPostgres(
	db: Kysely<Database>,
	redis: any,
	batchSize = 1000,
	logger: any,
) {
	try {
		// Get a batch of reactions from Postgres
		const reactions = await db
			.selectFrom('reactions')
			.select(['userId', 'postId', 'type'])
			.limit(batchSize)
			.orderBy('updated', 'desc')
			.execute();

		// Process in batches with a pipeline for efficiency
		const pipeline = redis.pipeline();

		for (const reaction of reactions) {
			const userShardId = Number(reaction.userId % 100n);
			const postShardId = Number(reaction.postId % 100n);

			const postReactionsKey = `post:${postShardId}:${reaction.postId}:reactions`;
			const userReactionsKey = `user:${userShardId}:${reaction.userId}:reactions`;

			// Set the reaction in Redis
			pipeline.hset(
				postReactionsKey,
				reaction.userId.toString(),
				reaction.type,
			);
			pipeline.hset(
				userReactionsKey,
				reaction.postId.toString(),
				reaction.type,
			);
		}

		await pipeline.exec();
		logger.info(
			`Reconciled ${reactions.length} reactions from Postgres to Redis`,
		);
	} catch (error) {
		logger.error('Reconciliation job failed', { error });
	}
}
