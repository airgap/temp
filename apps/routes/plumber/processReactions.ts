import { client as clickhouse } from '@lyku/clickhouse-client';
import { client as elastic } from '@lyku/elasticsearch-client';
import { client as postgres } from '@lyku/postgres-client';
import { client as redis } from '@lyku/redis-client';

interface ReactionRecord {
	postId: string;
	reaction: string;
	count: number;
	updated_at: string;
}

// Constants for viral post handling
const VIRAL_POST_THRESHOLD = 10000; // Threshold for considering a post viral

interface PostMetadata {
	id: string;
	publish: string;
}

export async function processReactions() {
	try {
		console.info('Processing reactions for Elasticsearch indexing');
		const lastProcessedTime = await getLastProcessedTime();
		console.info('Last processing time:', { lastProcessedTime });

		// Get posts with updated reaction counts
		const result = await clickhouse.query({
			query: `
        SELECT
          postId,
          reaction,
          count,
          updated_at
        FROM post_reaction_counts
        WHERE updated_at > toDateTime64('${lastProcessedTime}', 3)
        ORDER BY updated_at
        LIMIT 10000
      `,
			format: 'JSONEachRow',
		});
		const reactionData = (await result.json()) as ReactionRecord[];
		console.info('Found updated reaction records', {
			count: reactionData.length,
		});
		if (reactionData.length === 0) return [];

		// Organize reaction data by post
		const postMap = new Map<
			string,
			{
				reactions: Record<string, number>;
				updated_at: string;
				isViral: boolean;
			}
		>();

		// Initial pass to collect reaction counts by post
		for (const record of reactionData) {
			const postId = record.postId.toString();

			if (!postMap.has(postId)) {
				postMap.set(postId, {
					reactions: {},
					updated_at: record.updated_at,
					isViral: false, // Will check viral status later
				});
			}

			postMap.get(postId)!.reactions[record.reaction] = Number(record.count);

			// Compare dates directly as ISO strings to avoid parsing issues
			if (record.updated_at > postMap.get(postId)!.updated_at) {
				postMap.get(postId)!.updated_at = record.updated_at;
			}
		}

		const affectedPostIds = Array.from(postMap.keys());
		if (affectedPostIds.length === 0) return [];

		// Check for viral posts by getting total reaction counts
		await identifyViralPosts(postMap);

		// Get metadata needed for Elasticsearch indexing
		const postMetadata = await fetchPostMetadata(affectedPostIds);
		const bulkOperations = [];

		// Convert map entries to array for safer iteration
		const postMapEntries = Array.from(postMap.entries());
		for (const [postId, data] of postMapEntries) {
			const metadata = postMetadata.find((p) => p.id === postId) || {
				publish: new Date().toISOString(),
			};
			const publishDate = new Date(metadata.publish);
			const index = `posts-${publishDate.getFullYear()}-${publishDate.getMonth() + 1}`;

			// For viral posts, we need special handling in Elasticsearch
			if (data.isViral) {
				// Add viral flag to Elasticsearch document
				bulkOperations.push({ update: { _index: index, _id: postId } });
				bulkOperations.push({
					script: {
						source:
							'ctx._source.reactions = params.reactions; ctx._source.isViralPost = true; ctx._source.totalReactions = params.totalReactions',
						params: {
							reactions: data.reactions,
							totalReactions: Object.values(data.reactions).reduce(
								(sum, count) => sum + count,
								0,
							),
						},
					},
				});
			} else {
				// Standard update for regular posts
				bulkOperations.push({ update: { _index: index, _id: postId } });
				bulkOperations.push({
					script: {
						source:
							'ctx._source.reactions = params.reactions; ctx._source.isViralPost = false',
						params: { reactions: data.reactions },
					},
				});
			}
		}

		if (bulkOperations.length > 0) {
			// Execute Elasticsearch bulk operation
			const bulkResponse = await elastic.bulk({
				operations: bulkOperations,
				refresh: true,
			});
			console.info('Elasticsearch bulk update complete', {
				totalItems: bulkOperations.length / 2,
				errors: bulkResponse.errors,
			});

			// Update Redis viral flags for affected posts
			await updateRedisViralFlags(postMap);

			// Update checkpoint
			await updateLastProcessedTime(
				reactionData[reactionData.length - 1].updated_at,
			);
		}

		return affectedPostIds;
	} catch (error) {
		console.error('Error processing reactions:', { error });
		throw error;
	}
}

/**
 * Identifies which posts are viral based on reaction counts
 * and updates the postMap with this information
 */
async function identifyViralPosts(
	postMap: Map<
		string,
		{ reactions: Record<string, number>; updated_at: string; isViral: boolean }
	>,
): Promise<void> {
	try {
		// Get total reaction counts for all posts in the map
		const postIds = Array.from(postMap.keys());

		if (postIds.length === 0) return;

		// Convert string post IDs to proper format for SQL query
		const postIdParams = postIds.map((id) => `'${id}'`).join(',');

		// Get total reaction counts from database
		const reactionCounts = await postgres
			.selectFrom('reactions')
			.select(['postId', postgres.fn.count<string>('userId').as('total_count')])
			.whereRef('postId', 'in', postgres.raw(`(${postIdParams})`))
			.groupBy(['postId'])
			.execute();

		// Update the postMap with viral status
		for (const { postId, total_count } of reactionCounts) {
			const postIdStr = postId.toString();
			if (postMap.has(postIdStr)) {
				const count = parseInt(total_count, 10);
				postMap.get(postIdStr)!.isViral = count >= VIRAL_POST_THRESHOLD;

				console.info(`Post ${postIdStr} has ${count} reactions`, {
					isViral: postMap.get(postIdStr)!.isViral,
				});
			}
		}
	} catch (error) {
		console.error('Error identifying viral posts:', { error });
		// Continue processing even if this fails - we'll assume posts are not viral
	}
}

/**
 * Updates Redis viral flags for all affected posts
 */
async function updateRedisViralFlags(
	postMap: Map<
		string,
		{ reactions: Record<string, number>; updated_at: string; isViral: boolean }
	>,
): Promise<void> {
	try {
		// Use pipelining for efficient Redis updates
		const pipeline = redis.pipeline();

		for (const [postId, data] of postMap.entries()) {
			const viralFlagKey = `post:{${postId}}:viral`;
			const totalReactionsKey = `post:{${postId}}:total_reactions`;

			if (data.isViral) {
				// Set viral flag and total reactions count
				const totalReactions = Object.values(data.reactions).reduce(
					(sum, count) => sum + count,
					0,
				);
				pipeline.set(viralFlagKey, '1', 'EX', 86400);
				pipeline.set(totalReactionsKey, totalReactions.toString(), 'EX', 86400);
			} else {
				// Remove viral flag if it exists (post might have been viral before)
				pipeline.del(viralFlagKey);
				pipeline.del(totalReactionsKey);
			}
		}

		await pipeline.exec();
		console.info('Updated Redis viral flags for affected posts', {
			count: postMap.size,
		});
	} catch (error) {
		console.error('Error updating Redis viral flags:', { error });
		// Non-critical operation, continue even if this fails
	}
}

async function fetchPostMetadata(postIds: string[]): Promise<PostMetadata[]> {
	if (postIds.length === 0) return [];

	try {
		// For ClickHouse, use the IN operator with a tuple of values
		const query = `
      SELECT
        toString(id) AS id,
        publish
      FROM posts
      WHERE id IN (${postIds.map((id) => `'${id}'`).join(',')})
    `;

		const result = await clickhouse.query({
			query,
			format: 'JSONEachRow',
		});

		return (await result.json()) as PostMetadata[];
	} catch (error) {
		console.error('Error fetching post metadata:', { error, postIds });
		return [];
	}
}

async function getLastProcessedTime(): Promise<string> {
	try {
		console.info('Getting last processed time from ClickHouse');
		const result = await clickhouse.query({
			query: `
        SELECT max(processed_time) AS last_time
        FROM sync_checkpoint
      `,
			format: 'JSONEachRow',
		});

		const data = (await result.json()) as [] | [{ last_time: string }];
		const lastTime = data[0]?.last_time || '1970-01-01 00:00:00.000';
		console.info('Retrieved last processed time', { lastTime });
		return lastTime;
	} catch (error) {
		console.error('Error getting last processed time:', { error });
		return '1970-01-01 00:00:00.000';
	}
}

async function updateLastProcessedTime(time: string): Promise<void> {
	try {
		await clickhouse.query({
			query: `
        INSERT INTO sync_checkpoint (processed_time)
        VALUES (toDateTime64('${time}', 3))
      `,
		});
		console.info('Updated last processed time', { time });
	} catch (error) {
		console.error('Error updating last processed time:', { error, time });
		throw error;
	}
}
