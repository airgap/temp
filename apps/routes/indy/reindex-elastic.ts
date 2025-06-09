#!/usr/bin/env bun
import { client as db } from '@lyku/postgres-client';
import { client as es } from '@lyku/elasticsearch-client';
import type { Post } from '@lyku/bson-models';

// Configuration
const BATCH_SIZE = 1000;
const START_DATE = process.env.START_DATE
	? new Date(process.env.START_DATE)
	: new Date('2020-01-01');
const END_DATE = process.env.END_DATE
	? new Date(process.env.END_DATE)
	: new Date();

export async function createIndexIfNotExists(indexName: string) {
	try {
		const exists = await es.indices.exists({ index: indexName });
		if (!exists) {
			await es.indices.create({
				index: indexName,
				body: {
					mappings: {
						properties: {
							id: { type: 'keyword' },
							body: { type: 'text' },
							bodyType: { type: 'keyword' },
							echoes: { type: 'long' },
							group: { type: 'keyword' },
							hashtags: { type: 'keyword' },
							author: { type: 'keyword' },
							likes: { type: 'long' },
							loves: { type: 'long' },
							publish: { type: 'date' },
							replies: { type: 'long' },
							title: { type: 'text' },
							thread: { type: 'keyword' },
							replyTo: { type: 'keyword' },
							echoing: { type: 'keyword' },
							attachments: { type: 'keyword' },
							updated: { type: 'date' },
							created: { type: 'date' },
							banned: { type: 'date' },
							deleted: { type: 'date' },
						},
					},
				},
			});
			console.log(`Created index: ${indexName}`);
		}
	} catch (error) {
		console.error(`Error checking/creating index ${indexName}:`, error);
	}
}

async function elasticatePost(post: any): Promise<void> {
	const publishString = post.publish.toISOString();
	const [year, month] = publishString.split('T')[0].split('-');
	const index = `posts-${year}-${month}`;

	// Ensure index exists
	await createIndexIfNotExists(index);

	// Convert BigInts to strings for JSON serialization
	const elasticPost = {
		id: post.id.toString(),
		body: post.body,
		bodyType: post.bodyType,
		echoes: post.echoes?.toString(),
		group: post.group?.toString(),
		hashtags: post.hashtags?.map((h: bigint) => h.toString()),
		author: post.author.toString(),
		likes: post.likes.toString() ?? '0',
		loves: post.loves?.toString() ?? '0',
		publish: post.publish.toISOString(),
		replies: post.replies?.toString() ?? '0',
		title: post.title,
		thread: post.thread?.map((t: bigint) => t.toString()) ?? [],
		replyTo: post.replyTo?.toString(),
		echoing: post.echoing?.toString(),
		attachments: post.attachments?.map((a: bigint) => a.toString()) ?? [],
		updated: post.updated?.toISOString(),
		created: post.created?.toISOString(),
		banned: post.banned?.toISOString(),
		deleted: post.deleted?.toISOString(),
	};

	try {
		await es.index({
			index,
			id: elasticPost.id,
			body: elasticPost,
			refresh: false, // Don't refresh immediately for better performance
		});
	} catch (error) {
		console.error(`Failed to index post ${elasticPost.id}:`, error);
		throw error;
	}
}

export async function reindexPosts() {
	console.log(
		`Starting reindex from ${START_DATE.toISOString()} to ${END_DATE.toISOString()}`,
	);
	console.log(`Batch size: ${BATCH_SIZE}`);

	let processedCount = 0;
	let lastId: bigint | null = null;
	let hasMore = true;

	while (hasMore) {
		// Build query
		let query = db
			.selectFrom('posts')
			.selectAll()
			.where('publish', '>=', START_DATE)
			.where('publish', '<=', END_DATE)
			.where('deleted', 'is', null) // Skip deleted posts
			.orderBy('id', 'asc')
			.limit(BATCH_SIZE);

		if (lastId !== null) {
			query = query.where('id', '>', lastId);
		}

		const posts = await query.execute();

		if (posts.length === 0) {
			hasMore = false;
			break;
		}

		// Process posts in parallel batches
		const batchPromises = posts.map((post) => elasticatePost(post));

		try {
			await Promise.all(batchPromises);
			processedCount += posts.length;
			lastId = posts[posts.length - 1].id;

			console.log(`Processed ${processedCount} posts (last ID: ${lastId})`);
		} catch (error) {
			console.error('Error processing batch:', error);
			// Continue with next batch despite errors
		}

		// If we got fewer posts than the batch size, we're done
		if (posts.length < BATCH_SIZE) {
			hasMore = false;
		}
	}

	console.log(`Reindexing complete. Total posts processed: ${processedCount}`);

	// Refresh all indices at the end for better search performance
	try {
		await es.indices.refresh({ index: 'posts-*' });
		console.log('All indices refreshed');
	} catch (error) {
		console.error('Error refreshing indices:', error);
	}
}
