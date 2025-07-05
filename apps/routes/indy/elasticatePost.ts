import type { Post } from '@lyku/json-models';
import { client as elastic } from '@lyku/elasticsearch-client';

export async function elasticatePost(post: Post): Promise<void> {
	const publishString = post.publish.toISOString();
	const [year, month] = publishString.split('T')[0].split('-');
	const index = `posts-${year}-${month}`;
	// Convert BigInts to strings for JSON serialization
	const elasticPost = {
		id: post.id.toString(),
		body: post.body,
		bodyType: post.bodyType,
		echoes: post.echoes?.toString(),
		group: post.group?.toString(),
		hashtags: post.hashtags?.map((h) => h.toString()),
		author: post.author.toString(),
		likes: post.likes.toString() ?? '0',
		loves: post.loves?.toString() ?? '0',
		publish: post.publish.toISOString(),
		replies: post.replies?.toString() ?? '0',
		title: post.title,
		thread: post.thread?.map((t) => t.toString()) ?? [],
		replyTo: post.replyTo?.toString(),
		echoing: post.echoing?.toString(),
		attachments: post.attachments?.map((a) => a.toString()) ?? [],
		updated: post.updated?.toISOString(),
		created: post.created?.toISOString(),
		banned: post.banned?.toISOString(),
		deleted: post.deleted?.toISOString(),
	};

	console.log('Indexing', index, elasticPost);

	try {
		await elastic.index({
			index,
			id: elasticPost.id,
			body: elasticPost,
		});
	} catch (error) {
		console.error(`Failed to index post in Elasticsearch:`, error);
		throw new Error('Fukt');
	}
}
