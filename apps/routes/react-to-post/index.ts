import { handleReactToPost } from '@lyku/handles';
import { Err, reactionWorth } from '@lyku/helpers';
import { Reaction } from '@lyku/json-models';
import { client as redis } from '@lyku/redis-client';
import { client as clickhouse } from '@lyku/clickhouse-client';
import { client, client as pg } from '@lyku/postgres-client';
import { defaultLogger as logger } from '@lyku/logger';

// Add a retry queue system
import { addToRetryQueue } from '@lyku/queue-system';
import { parseBON, stringifyBON } from 'from-schema';

// Constants for configuration
const REDIS_PERSISTENCE_RETRY_QUEUE = 'redis:persistence:retry';
const MAX_RETRY_ATTEMPTS = 3;

export default handleReactToPost(
	async ({ postId, type }, { requester, now }) => {
		try {
			console.log('Reacting to', postId);
			// 1. First check if post exists - this is still necessary but can be cached
			const postCacheKey = `post:{${postId}}:exists`;
			let postExists = await redis.get(postCacheKey);
			console.log('postExists', postExists);
			if (postExists === null) {
				// Only hit the database if we don't have it cached
				const post = await client
					.selectFrom('posts')
					.select(['id', 'author']) // Only select what we need
					.where('id', '=', postId)
					.executeTakeFirst();

				if (!post) throw new Err(404, "Post doesn't exist in postgres");
				postExists = stringifyBON({ id: post.id, author: post.author });

				// Cache the existence check with expiration
				await redis.set(postCacheKey, postExists, 'EX', 3600); // 1 hour cache
			}

			const { author, id } = parseBON(postExists) as {
				id: bigint;
				author: bigint;
			};

			if (author === requester) {
				throw new Err(403, 'You cannot like your own post');
			}

			// 2. Redis keys using hash tags for proper Redis cluster sharding
			const postReactionsKey = `post:{${postId}}:reactions`;
			const userReactionsKey = `user:{${requester}}:reactions`;
			const reactionCountsKey = `post:{${postId}}:reaction_counts`;

			// 3. Improved Redis Lua script with better error handling and viral post handling
			const luaScript = `
        -- Check if reaction set exists for this post
        local setExists = redis.call('EXISTS', KEYS[1])

        -- If set doesn't exist, return special flag to load from DB
        if setExists == 0 then
          return 'LOAD_FROM_DB'
        end

        -- Check if this is a viral post (too many reactions to cache them all)
        local isViralPost = redis.call('EXISTS', KEYS[4]) == 1

        -- Get previous reaction
        local previousReaction = redis.call('HGET', KEYS[1], ARGV[1])

        -- For viral posts, we need special handling
        if isViralPost then
          -- If user's reaction isn't in our sample, check DB directly
          if not previousReaction and ARGV[2] ~= '' then
            -- For viral posts without cached entry, return flag to check DB
            return 'CHECK_DB_VIRAL'
          end
        end

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

          -- For viral posts, also increment total count if it's a new reaction
          if isViralPost and not previousReaction then
            redis.call('INCR', KEYS[5])
          end
        else
          -- Remove reaction
          redis.call('HDEL', KEYS[1], ARGV[1])
          redis.call('HDEL', KEYS[2], ARGV[3])

          -- For viral posts, also decrement total count if removing reaction
          if isViralPost and previousReaction then
            redis.call('DECR', KEYS[5])
          end
        end

        return previousReaction
      `;

			// Additional keys for viral post handling
			const viralFlagKey = `post:{${postId}}:viral`;
			const totalReactionsKey = `post:{${postId}}:total_reactions`;

			// Execute the script atomically with proper error handling
			let previousReaction: Reaction | undefined;
			try {
				const result = await redis.eval(
					luaScript,
					5, // Number of keys (increased to support viral post flags)
					postReactionsKey, // KEYS[1]
					userReactionsKey, // KEYS[2]
					reactionCountsKey, // KEYS[3]
					viralFlagKey, // KEYS[4]
					totalReactionsKey, // KEYS[5]
					requester.toString(), // ARGV[1]
					type || '', // ARGV[2]
					postId.toString(), // ARGV[3]
				);

				// Check if we need to load the reaction set from the database
				if (result === 'LOAD_FROM_DB') {
					logger.info('Loading reaction set from database', { postId });

					// Load and cache the post's reaction set
					await loadReactionSetFromDB(postId);

					// Retry the operation now that data is cached
					previousReaction = (await redis.eval(
						luaScript,
						5, // Updated number of keys
						postReactionsKey,
						userReactionsKey,
						reactionCountsKey,
						viralFlagKey,
						totalReactionsKey,
						requester.toString(),
						type || '',
						postId.toString(),
					)) as Reaction | undefined;
				} else if (result === 'CHECK_DB_VIRAL') {
					// Special case for viral posts where user's reaction isn't in cached sample
					logger.info('Viral post: checking database for user reaction', {
						postId,
						userId: requester,
					});

					// Check if user has a previous reaction directly from DB
					previousReaction = await getFallbackReaction(requester, postId);

					// Update Redis counters directly
					const pipeline = redis.pipeline();

					// If there was a previous reaction, decrement its count
					if (previousReaction) {
						pipeline.hincrby(reactionCountsKey, previousReaction, -1);
					}

					// If adding a new reaction
					if (type) {
						// Always update the user's reaction in Redis sample for future lookups
						pipeline.hset(postReactionsKey, requester.toString(), type);
						pipeline.hset(userReactionsKey, postId.toString(), type);

						// Increment count for the new reaction
						pipeline.hincrby(reactionCountsKey, type, 1);

						// Update total count if needed
						if (!previousReaction) {
							pipeline.incr(totalReactionsKey);
						}
					} else if (previousReaction) {
						// Removing reaction
						pipeline.hdel(postReactionsKey, requester.toString());
						pipeline.hdel(userReactionsKey, postId.toString());

						// Decrement total count
						pipeline.decr(totalReactionsKey);
					}

					await pipeline.exec();
				} else {
					previousReaction = result as Reaction | undefined;
				}
			} catch (redisError) {
				logger.error('Redis reaction operation failed', {
					error: redisError,
					postId,
					userId: requester,
				});
				// Fall back to direct DB if Redis fails
				previousReaction = await getFallbackReaction(requester, postId);
			}

			// 4. More robust persistence with retries
			try {
				await persistReactionToPostgres(
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
					table: 'user_post_reactions_raw',
					values: [
						{
							userId: requester.toString(),
							postId: postId.toString(),
							reaction: type,
							created: now,
							updated: now,
						},
					],
				});
			} catch (chError) {
				logger.error('ClickHouse insert failed', {
					error: chError?.message,
					postId,
					userId: requester,
				});
				// ClickHouse errors are less critical - we can tolerate some loss here
			}

			// 6. Point allocation with better error handling
			if (author !== requester && type) {
				try {
					await clickhouse.insert({
						table: 'user_point_grants_raw',
						values: [
							{
								userId: author,
								reason: 'post_reacted',
								key: `${requester}-${id}`,
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
						authorId: author,
						userId: requester,
					});
					// Points can be reconciled later through analytics
				}
			}

			// 7. Return object with success status and reaction information
			// return {
			// 	success: true,
			// 	postId,
			// 	newReaction: type,
			// 	previousReaction,
			// };
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
	userId: bigint,
	postId: bigint,
): Promise<Reaction | undefined> {
	const existingReaction = await client
		.selectFrom('reactions')
		.select(['type'])
		.where('userId', '=', userId)
		.where('postId', '=', postId)
		.executeTakeFirst();

	return existingReaction?.type;
}

// Helper to load a post's reaction set from database and cache in Redis
async function loadReactionSetFromDB(postId: bigint): Promise<void> {
	// For viral posts, only load reaction counts and recent reactions
	// Check reaction count first to determine if this is a viral post
	const reactionCount = await client
		.selectFrom('reactions')
		.select(client.fn.count<number>('userId').as('count'))
		.where('postId', '=', postId)
		.executeTakeFirst();

	const count = reactionCount?.count ?? 0;
	const isViralPost = count > 10000; // Threshold for viral posts

	// Prepare for batch updates
	const postReactionsKey = `post:{${postId}}:reactions`;
	const reactionCountsKey = `post:{${postId}}:reaction_counts`;
	const viralFlagKey = `post:{${postId}}:viral`;

	// For viral posts, take a different approach
	if (isViralPost) {
		logger.info('Viral post detected, loading optimized reaction data', {
			postId,
			reactionCount: count,
		});

		// Set a flag indicating this is a viral post
		await redis.set(viralFlagKey, '1', 'EX', 86400);

		// 1. Get reaction counts by type
		const reactionTypeCounts = await client
			.selectFrom('reactions')
			.select(['type'])
			.select(client.fn.count<number>('userId').as('count'))
			.where('postId', '=', postId)
			.groupBy(['type'])
			.execute();

		// 2. Only load most recent reactions (up to 1000)
		const recentReactions = await client
			.selectFrom('reactions')
			.select(['userId', 'type'])
			.where('postId', '=', postId)
			.orderBy('updated', 'desc')
			.limit(1000)
			.execute();

		// Create a pipeline for efficiency
		const pipeline = redis.pipeline();

		// Store the total count for reference
		pipeline.set(
			`post:{${postId}}:total_reactions`,
			count.toString(),
			'EX',
			86400,
		);

		// Add reaction counts
		for (const { type, count } of reactionTypeCounts) {
			pipeline.hset(reactionCountsKey, type, count.toString());
		}

		// Store only recent reactions in the post reactions hash
		for (const reaction of recentReactions) {
			// Update post reactions hash with recent reactions
			pipeline.hset(
				postReactionsKey,
				reaction.userId.toString(),
				reaction.type,
			);

			// Update user reaction hash
			const userReactionsKey = `user:{${reaction.userId}}:reactions`;
			pipeline.hset(userReactionsKey, postId.toString(), reaction.type);
		}

		// Set TTL for the cached data (24 hours)
		pipeline.expire(postReactionsKey, 86400);
		pipeline.expire(reactionCountsKey, 86400);

		// Execute pipeline
		await pipeline.exec();
		return;
	}

	// For normal posts, load all reactions
	const reactions = await client
		.selectFrom('reactions')
		.select(['userId', 'type'])
		.where('postId', '=', postId)
		.execute();

	if (reactions.length === 0) return;

	// Create counts by reaction type
	const reactionCounts: Record<string, number> = {};

	// Create a pipeline for efficiency
	const pipeline = redis.pipeline();

	// Add each reaction to the Redis hash
	for (const reaction of reactions) {
		// Update post reactions hash
		pipeline.hset(postReactionsKey, reaction.userId.toString(), reaction.type);

		// Update user reaction hash
		const userReactionsKey = `user:{${reaction.userId}}:reactions`;
		pipeline.hset(userReactionsKey, postId.toString(), reaction.type);

		// Count reactions by type
		reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
	}

	// Add reaction counts to Redis
	for (const [reactionType, count] of Object.entries(reactionCounts)) {
		pipeline.hset(reactionCountsKey, reactionType, count.toString());
	}

	// Set TTL for the cached data (24 hours)
	pipeline.expire(postReactionsKey, 86400);
	pipeline.expire(reactionCountsKey, 86400);

	// Execute all commands atomically
	await pipeline.exec();
}

// Improved persistence function with proper parameter naming
async function persistReactionToPostgres(
	userId: bigint,
	postId: bigint,
	newReaction: string,
	oldReaction: string,
) {
	if (!newReaction) {
		// Delete the reaction
		await client
			.deleteFrom('reactions')
			.where('userId', '=', userId)
			.where('postId', '=', postId)
			.execute();
	} else {
		// Use upsert pattern for handling both inserts and updates
		await client
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
	batchSize = 1000,
	logger: any,
) {
	try {
		// Get a batch of reactions from Postgres
		const reactions = await client
			.selectFrom('reactions')
			.select(['userId', 'postId', 'type'])
			.limit(batchSize)
			.orderBy('updated', 'desc')
			.execute();

		// Group reactions by postId to update counts efficiently
		const postReactionsMap = new Map<string, Map<string, string>>();
		const postCountMap = new Map<string, Record<string, number>>();
		const postTotalReactionCount = new Map<string, number>();

		for (const reaction of reactions) {
			const postIdStr = reaction.postId.toString();

			// Initialize maps for this post if not already done
			if (!postReactionsMap.has(postIdStr)) {
				postReactionsMap.set(postIdStr, new Map());
				postCountMap.set(postIdStr, {});
				postTotalReactionCount.set(postIdStr, 0);
			}

			// Store reactions and update counts
			postReactionsMap
				.get(postIdStr)!
				.set(reaction.userId.toString(), reaction.type);

			const counts = postCountMap.get(postIdStr)!;
			counts[reaction.type] = (counts[reaction.type] || 0) + 1;

			// Increment total reaction count for this post
			postTotalReactionCount.set(
				postIdStr,
				(postTotalReactionCount.get(postIdStr) || 0) + 1,
			);
		}

		// Process in batches with a pipeline for efficiency
		const pipeline = redis.pipeline();

		// Check for viral posts
		for (const [postIdStr, totalCount] of postTotalReactionCount.entries()) {
			// For posts in our batch, get their total reaction count from DB
			const postId = BigInt(postIdStr);

			// If our sample suggests this might be a viral post, check full count
			if (totalCount > 100) {
				const fullCountResult = await client
					.selectFrom('reactions')
					.select(client.fn.count<number>('userId').as('count'))
					.where('postId', '=', postId)
					.executeTakeFirst();

				const fullCount = fullCountResult?.count ?? 0;

				// If this is a viral post (has more than 10,000 reactions)
				if (fullCount > 10000) {
					const viralFlagKey = `post:{${postId}}:viral`;
					const totalReactionsKey = `post:{${postId}}:total_reactions`;
					const postReactionsKey = `post:{${postId}}:reactions`;

					// Set the viral flag and total reactions count
					pipeline.set(viralFlagKey, '1', 'EX', 86400);
					pipeline.set(totalReactionsKey, fullCount.toString(), 'EX', 86400);

					logger.info(
						`Marked post ${postId} as viral with ${fullCount} reactions`,
					);
				}
			}
		}

		// First pass: individual user reactions
		for (const reaction of reactions) {
			const postReactionsKey = `post:{${reaction.postId}}:reactions`;
			const userReactionsKey = `user:{${reaction.userId}}:reactions`;

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

		// Second pass: reaction counts by post
		for (const [postIdStr, counts] of postCountMap.entries()) {
			const postId = BigInt(postIdStr);
			const reactionCountsKey = `post:{${postId}}:reaction_counts`;

			// Delete existing counts to avoid stale data
			pipeline.del(reactionCountsKey);

			// Set the counts for each reaction type
			for (const [reactionType, count] of Object.entries(counts)) {
				pipeline.hset(reactionCountsKey, reactionType, count.toString());
			}

			// Set TTL for these keys
			pipeline.expire(reactionCountsKey, 86400); // 24 hours

			const postReactionsKey = `post:{${postId}}:reactions`;
			pipeline.expire(postReactionsKey, 86400); // 24 hours
		}

		await pipeline.exec();
		logger.info(
			`Reconciled ${reactions.length} reactions from Postgres to Redis`,
		);
	} catch (error) {
		logger.error('Reconciliation job failed', { error });
	}
}
