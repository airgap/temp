import type { Post } from '@lyku/json-models';

export async function elasticate(post: Post): Promise<void> {
	const publishString = post.publish.toISOString();
	const [year, month] = publishString.split('T')[0].split('-');
	const index = `posts-${year}-${month}`;
	// Convert BigInts to strings for JSON serialization
	const elasticPost = {
		id: post.id.toString(),
		body: post.body,
		bodyType: post.bodyType,
		echoes: post.echoes.toString(),
		group: post.group?.toString(),
		hashtags: post.hashtags?.map((h) => h.toString()),
		author: post.author.toString(),
		likes: post.likes.toString(),
		loves: post.loves?.toString(),
		publish: post.publish,
		replies: post.replies.toString(),
		title: post.title,
		thread: post.thread?.map((t) => t.toString()),
		shortcode: post.shortcode,
		replyTo: post.replyTo?.toString(),
		echoing: post.echoing?.toString(),
		attachments: post.attachments?.map((a) => a.toString()),
		updated: post.updated?.toISOString(),
		// Add engagement score for ranking
		engagement_score:
			Number(post.likes) +
			(Number(post.loves) || 0) * 10 +
			Number(post.echoes) * 5,
	};

	const url = `${process.env.ELASTIC_API_ENDPOINT}/${index}/_doc/${elasticPost.id}`;
	const headers = new Headers({
		'Content-Type': 'application/json',
		Authorization: `ApiKey ${process.env.ELASTIC_API_KEY}`,
	});

	console.log('Fetching', url);

	const res = await fetch(url, {
		method: 'PUT',
		headers,
		body: JSON.stringify(elasticPost),
	});

	if (!res.ok) {
		throw new Error(`Failed to index post in Elasticsearch: ${res.statusText}`);
	}
}
