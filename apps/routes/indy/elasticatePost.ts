import type { Post } from '@lyku/json-models';

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

	const url = `${process.env.ELASTIC_API_ENDPOINT}/${index}/_doc/${elasticPost.id}`;
	const headers = new Headers({
		'Content-Type': 'application/json',
		Authorization: `ApiKey ${process.env.ELASTIC_API_KEY}`,
	});

	console.log('Fetching', url, elasticPost);

	const res = await fetch(url, {
		method: 'PUT',
		headers,
		body: JSON.stringify(elasticPost),
	});

	if (!res.ok) {
		console.error(`Failed to index post in Elasticsearch: ${res.statusText}`);
		console.error(await res.text());
		throw new Error('Fukt');
	}
}
