import { Client } from '@elastic/elasticsearch';
// Import directly from node_modules instead of using the TypeScript path alias
import { createClient } from '@clickhouse/client';

// Create the clickhouse client directly instead of using route-helpers
const clickhouse = createClient({
  url: process.env.CH_ENDPOINT,
  password: process.env.CH_PASSWORD,
  username: process.env.CH_USERNAME,
});

const elastic = new Client({
	node: process.env.ELASTIC_API_ENDPOINT,
	auth: { apiKey: process.env.ELASTIC_API_KEY ?? '' },
});

interface ReactionRecord {
	postId: string;
	reaction: string;
	count: number;
	updated_at: string;
}

interface PostMetadata {
	id: string;
	publish: string;
}

export async function processReactions() {
	try {
		const lastProcessedTime = await getLastProcessedTime();

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
		if (reactionData.length === 0) return [];

		const postMap = new Map<
			string,
			{ reactions: Record<string, number>; updated_at: string }
		>();

		for (const record of reactionData) {
			const postId = record.postId.toString();

			if (!postMap.has(postId)) {
				postMap.set(postId, { reactions: {}, updated_at: record.updated_at });
			}

			postMap.get(postId)!.reactions[record.reaction] = Number(record.count);

			// Compare dates directly as ISO strings to avoid parsing issues
			if (record.updated_at > postMap.get(postId)!.updated_at) {
				postMap.get(postId)!.updated_at = record.updated_at;
			}
		}

		const affectedPostIds = Array.from(postMap.keys());
		if (affectedPostIds.length === 0) return [];

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

			bulkOperations.push({ update: { _index: index, _id: postId } });
			bulkOperations.push({
				script: {
					source: 'ctx._source.reactions = params.reactions',
					params: { reactions: data.reactions },
				},
			});
		}

		if (bulkOperations.length > 0) {
			await elastic.bulk({ operations: bulkOperations, refresh: true });
			await updateLastProcessedTime(
				reactionData[reactionData.length - 1].updated_at,
			);
		}

		return affectedPostIds;
	} catch (error) {
		console.error('Error processing reactions:', error);
		throw error;
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
		console.error('Error fetching post metadata:', error);
		return [];
	}
}

async function getLastProcessedTime(): Promise<string> {
	try {
		const result = await clickhouse.query({
			query: `
        SELECT max(processed_time) AS last_time
        FROM sync_checkpoint
      `,
			format: 'JSONEachRow',
		});

		const data = (await result.json()) as [] | [{ last_time: string }];
		return data[0]?.last_time || '1970-01-01 00:00:00.000';
	} catch (error) {
		console.error('Error getting last processed time:', error);
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
	} catch (error) {
		console.error('Error updating last processed time:', error);
		throw error;
	}
}
