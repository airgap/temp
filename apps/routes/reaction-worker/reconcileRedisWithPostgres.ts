import { client as redis } from '@lyku/redis-client';
import { client as clickhouse } from '@lyku/clickhouse-client';
import { client as pg } from '@lyku/postgres-client';

// Background job to reconcile Redis with PostgreSQL
// This would be called by a scheduler periodically
export async function reconcileRedisWithPostgres(
	batchSize = 1000,
	logger: any,
) {
	try {
		// Get a batch of reactions from Postgres
		const reactions = await pg
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
				const fullCountResult = await pg
					.selectFrom('reactions')
					.select(pg.fn.count<number>('userId').as('count'))
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
