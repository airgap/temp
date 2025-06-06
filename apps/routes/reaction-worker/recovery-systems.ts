import { Kysely } from 'kysely';
import type { Database } from '@lyku/db-types';
import { JobProcessor } from '@lyku/queue-system';
import { MetricsClient } from '@lyku/metrics';

/**
 * Processor for handling reaction persistence retry operations
 */
export class ReactionPersistenceProcessor implements JobProcessor {
	constructor(
		private db: Kysely<Database>,
		private metrics: MetricsClient,
		private logger: any,
	) {
		this.metrics.incrementCounter('reaction_persistence_processor_initialized');
		this.logger.info('Reaction persistence processor initialized');
	}

	/**
	 * Process a persistence job from the retry queue
	 */
	async process(job: any): Promise<boolean> {
		const { operation, params, attempts } = job;

		this.metrics.incrementCounter('reaction_persistence_retry_attempts', {
			operation,
			attempt: attempts,
		});

		try {
			if (operation === 'persistReactionToPostgres') {
				const { userId, postId, newReaction, oldReaction } = params;

				// Execute the persistence operation
				await this.persistReactionToPostgres(
					userId,
					postId,
					newReaction,
					oldReaction,
				);

				this.metrics.incrementCounter('reaction_persistence_retry_success', {
					operation,
				});
				return true; // Success
			}

			throw new Error(`Unknown operation: ${operation}`);
		} catch (error) {
			this.logger.error('Retry persistence failed', {
				error,
				job,
				operation: job.operation,
			});
			this.metrics.incrementCounter('reaction_persistence_retry_failure', {
				operation: job.operation,
			});
			return false; // Failed, will be retried based on queue settings
		}
	}

	/**
	 * Persist a reaction to PostgreSQL
	 */
	private async persistReactionToPostgres(
		userId: bigint,
		postId: bigint,
		newReaction: string,
		oldReaction: string,
	): Promise<void> {
		const start = Date.now();

		try {
			if (!newReaction) {
				// Delete the reaction
				await this.db
					.deleteFrom('reactions')
					.where('userId', '=', userId)
					.where('postId', '=', postId)
					.execute();

				this.metrics.incrementCounter('reaction_persistence_deletes');
			} else {
				// Use upsert pattern for handling both inserts and updates
				await this.db
					.insertInto('reactions')
					.values({
						userId,
						postId,
						type: newReaction,
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

				this.metrics.incrementCounter('reaction_persistence_upserts');
			}

			const duration = Date.now() - start;
			this.metrics.recordHistogram(
				'reaction_persistence_duration_ms',
				duration,
			);

			this.logger.debug('Successfully persisted reaction to Postgres', {
				userId,
				postId,
				newReaction,
				oldReaction,
				durationMs: duration,
			});
		} catch (error) {
			this.metrics.incrementCounter('reaction_persistence_errors');
			this.logger.error('Failed to persist reaction to Postgres', {
				error,
				userId,
				postId,
				newReaction,
				oldReaction,
			});
			throw error; // Re-throw for retry logic
		}
	}
}

/**
 * Service for monitoring Redis health and performing recovery operations
 */
export class RedisRecoveryService {
	private isRecovering = false;

	constructor(
		private db: Kysely<Database>,
		private redis: any,
		private metrics: MetricsClient,
		private logger: any,
	) {
		this.metrics.incrementCounter('redis_recovery_service_initialized');
		this.logger.info('Redis recovery service initialized');
	}

	/**
	 * Check Redis health and initiate recovery if needed
	 */
	async checkRedisHealth(): Promise<boolean> {
		if (this.isRecovering) {
			return false;
		}

		try {
			// Check if Redis is responding
			const startTime = Date.now();
			await this.redis.ping();
			const latency = Date.now() - startTime;

			this.metrics.recordGauge('redis_ping_latency_ms', latency);

			// We'll consider Redis healthy if latency is under 200ms
			const isHealthy = latency < 200;

			if (!isHealthy) {
				this.logger.warn('Redis latency is high', { latency });
				this.metrics.incrementCounter('redis_high_latency_events');
			}

			return isHealthy;
		} catch (error) {
			this.logger.error('Redis health check failed', { error });
			this.metrics.incrementCounter('redis_health_check_failures');

			// Attempt recovery if not already in progress
			if (!this.isRecovering) {
				this.initiateRedisRecovery().catch((err) => {
					this.logger.error('Redis recovery failed', { error: err });
				});
			}

			return false;
		}
	}

	/**
	 * Initiate recovery process for Redis
	 */
	async initiateRedisRecovery(): Promise<void> {
		if (this.isRecovering) {
			return;
		}

		try {
			this.isRecovering = true;
			this.metrics.incrementCounter('redis_recovery_started');
			this.logger.info('Starting Redis recovery process');

			// Rebuild reaction data from PostgreSQL
			await this.rebuildReactionsFromPostgres();

			// Rebuild reaction counts
			await this.rebuildReactionCounts();

			this.metrics.incrementCounter('redis_recovery_completed');
			this.logger.info('Redis recovery process completed successfully');
		} catch (error) {
			this.metrics.incrementCounter('redis_recovery_failed');
			this.logger.error('Redis recovery process failed', { error });
		} finally {
			this.isRecovering = false;
		}
	}

	/**
	 * Rebuild reaction data in Redis from PostgreSQL
	 */
	private async rebuildReactionsFromPostgres(): Promise<void> {
		let processed = 0;
		let hasMore = true;
		let lastId = '0';
		const batchSize = 5000;

		while (hasMore) {
			// Get a batch of reactions from Postgres, using cursor-based pagination
			const reactions = await this.db
				.selectFrom('reactions')
				.select(['id', 'userId', 'postId', 'type'])
				.where('id', '>', lastId)
				.orderBy('id', 'asc')
				.limit(batchSize)
				.execute();

			if (reactions.length === 0) {
				hasMore = false;
				break;
			}

			// Update lastId for next batch
			lastId = reactions[reactions.length - 1].id.toString();

			// Process batch with pipeline for efficiency
			const pipeline = this.redis.pipeline();

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

			await pipeline.exec();
			processed += reactions.length;

			this.logger.info(`Rebuilt ${processed} reactions from Postgres to Redis`);
			this.metrics.recordGauge('redis_recovery_reactions_processed', processed);
		}
	}

	/**
	 * Rebuild reaction counts in Redis
	 */
	private async rebuildReactionCounts(): Promise<void> {
		// First clear all reaction count keys to avoid stale data
		// This is a pattern scan that finds all reaction count keys
		const keys = await this.scanAllKeys('post:*:reaction_counts');

		if (keys.length > 0) {
			const pipeline = this.redis.pipeline();

			// Split into batches of 1000 keys to avoid command size limits
			const batchSize = 1000;
			for (let i = 0; i < keys.length; i += batchSize) {
				const batch = keys.slice(i, i + batchSize);
				pipeline.del(...batch);
			}

			await pipeline.exec();
			this.logger.info(`Cleared ${keys.length} reaction count keys`);
		}

		// Now rebuild from the post:*:reactions keys
		const reactionKeys = await this.scanAllKeys('post:*:reactions');

		// Process in batches for efficiency
		const batchSize = 100;
		for (let i = 0; i < reactionKeys.length; i += batchSize) {
			const batch = reactionKeys.slice(i, i + batchSize);
			await this.processBatchReactionCounts(batch);

			this.logger.info(
				`Processed reaction counts for ${i + batch.length}/${reactionKeys.length} posts`,
			);
		}

		this.logger.info(
			`Rebuilt reaction counts for ${reactionKeys.length} posts`,
		);
	}

	/**
	 * Process a batch of reaction keys to rebuild counts
	 */
	private async processBatchReactionCounts(
		reactionKeys: string[],
	): Promise<void> {
		const pipeline = this.redis.pipeline();

		for (const reactionKey of reactionKeys) {
			try {
				// Extract postId from key pattern: post:{postId}:reactions
				const parts = reactionKey.split(':');
				// Skip if not in the expected format
				if (parts.length < 3) continue;

				// Extract postId from the pattern - handle both old and new formats
				const postIdStr = parts[1].includes('{')
					? parts[1].replace('{', '').replace('}', '')
					: parts.length === 4
						? parts[2]
						: parts[1];

				const countKey = `post:{${postIdStr}}:reaction_counts`;

				// Get all reactions for this post
				const reactions = await this.redis.hgetall(reactionKey);

				// Count each reaction type
				const counts: Record<string, number> = {};
				for (const userId in reactions) {
					const type = reactions[userId];
					counts[type] = (counts[type] || 0) + 1;
				}

				// Update count in Redis
				if (Object.keys(counts).length > 0) {
					for (const type in counts) {
						pipeline.hset(countKey, type, counts[type].toString());
					}
				}
			} catch (error) {
				this.logger.error('Error rebuilding reaction counts', {
					error,
					reactionKey,
				});
			}
		}

		await pipeline.exec();
	}

	/**
	 * Scan Redis for all keys matching a pattern
	 */
	private async scanAllKeys(pattern: string): Promise<string[]> {
		const allKeys: string[] = [];
		let cursor = '0';

		do {
			const [nextCursor, keys] = await this.redis.scan(
				cursor,
				'MATCH',
				pattern,
				'COUNT',
				'1000',
			);

			cursor = nextCursor;
			allKeys.push(...keys);
		} while (cursor !== '0');

		return allKeys;
	}

	/**
	 * Check if Redis has keys for a given post
	 * Can be used to detect data consistency issues
	 */
	async checkPostKeysExist(postId: bigint): Promise<boolean> {
		const postReactionsKey = `post:{${postId}}:reactions`;
		const countKey = `post:{${postId}}:reaction_counts`;

		try {
			// Check if either key exists
			const [reactionsExist, countsExist] = await Promise.all([
				this.redis.exists(postReactionsKey),
				this.redis.exists(countKey),
			]);

			return reactionsExist > 0 || countsExist > 0;
		} catch (error) {
			this.logger.error('Error checking post keys', { error, postId });
			return false;
		}
	}

	/**
	 * Reconcile a specific post's reactions between PostgreSQL and Redis
	 */
	async reconcilePostReactions(postId: bigint): Promise<void> {
		try {
			const postReactionsKey = `post:{${postId}}:reactions`;
			const countKey = `post:{${postId}}:reaction_counts`;

			// Get all reactions for this post from PostgreSQL
			const dbReactions = await this.db
				.selectFrom('reactions')
				.select(['userId', 'type'])
				.where('postId', '=', postId)
				.execute();

			// Get all reactions for this post from Redis
			const redisReactions = await this.redis.hgetall(postReactionsKey);

			// Convert DB reactions to a map for easier comparison
			const dbReactionsMap: Record<string, string> = {};
			for (const reaction of dbReactions) {
				dbReactionsMap[reaction.userId.toString()] = reaction.type;
			}

			// Find differences
			const toAdd: Array<{ userId: string; type: string }> = [];
			const toRemove: string[] = [];

			// Find reactions in DB but not in Redis (or different)
			for (const userId in dbReactionsMap) {
				const dbType = dbReactionsMap[userId];
				const redisType = redisReactions[userId];

				if (redisType !== dbType) {
					toAdd.push({ userId, type: dbType });
				}
			}

			// Find reactions in Redis but not in DB
			for (const userId in redisReactions) {
				if (!dbReactionsMap[userId]) {
					toRemove.push(userId);
				}
			}

			// Apply changes if needed
			if (toAdd.length > 0 || toRemove.length > 0) {
				const pipeline = this.redis.pipeline();

				// Remove reactions not in DB
				if (toRemove.length > 0) {
					for (const userId of toRemove) {
						pipeline.hdel(postReactionsKey, userId);
					}
				}

				// Add reactions from DB
				if (toAdd.length > 0) {
					for (const { userId, type } of toAdd) {
						pipeline.hset(postReactionsKey, userId, type);

						// Also update user's reactions
						const userReactionsKey = `user:{${userId}}:reactions`;
						pipeline.hset(userReactionsKey, postId.toString(), type);
					}
				}

				await pipeline.exec();

				// Rebuild counts
				const reactions = await this.redis.hgetall(postReactionsKey);
				const counts: Record<string, number> = {};

				for (const userId in reactions) {
					const type = reactions[userId];
					counts[type] = (counts[type] || 0) + 1;
				}

				// Clear existing counts and set new ones
				await this.redis.del(countKey);

				if (Object.keys(counts).length > 0) {
					const pipeline = this.redis.pipeline();
					for (const type in counts) {
						pipeline.hset(countKey, type, counts[type].toString());
					}
					await pipeline.exec();
				}

				this.logger.info(
					`Reconciled post ${postId} reactions: ${toAdd.length} added, ${toRemove.length} removed`,
				);
				this.metrics.incrementCounter('post_reactions_reconciled', {
					added: toAdd.length.toString(),
					removed: toRemove.length.toString(),
				});
			}
		} catch (error) {
			this.logger.error('Error reconciling post reactions', { error, postId });
			this.metrics.incrementCounter('post_reactions_reconciliation_errors');
		}
	}
}

/**
 * Setup monitoring for reaction systems
 */
export function setupReactionMonitoring(
	metrics: MetricsClient,
	redisClient: any,
): void {
	// Monitor Redis memory usage
	setInterval(async () => {
		try {
			const info = await redisClient.info('memory');
			const lines = info.split('\n');

			// Extract used_memory from info output
			const memoryLine = lines.find((line) => line.startsWith('used_memory:'));
			if (memoryLine) {
				const usedMemory = parseInt(memoryLine.split(':')[1]);
				metrics.recordGauge('redis_used_memory_bytes', usedMemory);
			}

			// Extract fragmentation ratio
			const fragLine = lines.find((line) =>
				line.startsWith('mem_fragmentation_ratio:'),
			);
			if (fragLine) {
				const fragRatio = parseFloat(fragLine.split(':')[1]);
				metrics.recordGauge('redis_fragmentation_ratio', fragRatio);
			}
		} catch (error) {
			console.error('Failed to collect Redis memory metrics', error);
		}
	}, 60000); // Every minute

	// Monitor Redis key counts
	setInterval(async () => {
		try {
			// Count reaction keys (sample only)
			const keyCount = await getSampleKeyCount(redisClient);
			metrics.recordGauge('redis_reaction_key_sample', keyCount);
		} catch (error) {
			console.error('Failed to collect Redis key count metrics', error);
		}
	}, 300000); // Every 5 minutes
}

/**
 * Get a sample count of keys to monitor growth
 */
async function getSampleKeyCount(redis: any): Promise<number> {
	// We'll just check a sample of shards to avoid expensive full scans
	const shards = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
	let count = 0;

	for (const shard of shards) {
		const [cursor, keys] = await redis.scan(
			0,
			'MATCH',
			`post:*:reactions`,
			'COUNT',
			'1000',
		);

		count += keys.length;
	}

	// Extrapolate to estimate total
	return count * 10; // Since we sampled 10 out of 100 shards
}
