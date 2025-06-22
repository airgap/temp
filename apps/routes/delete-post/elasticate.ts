import type { Post } from '@lyku/json-models';

export async function deleteFromElastic(post: {
	id: bigint;
	publish: Date;
}): Promise<void> {
	console.log('Post', post);
	console.log('Post publish', post.publish);
	const publishString = post.publish.toISOString();
	const [year, month] = publishString.split('T')[0].split('-');
	const index = `posts-${year}-${month}`;
	const id = post.id.toString();

	const url = `${process.env.ELASTIC_API_ENDPOINT}/${index}/_doc/${id}`;

	const res = await fetch(url, {
		method: 'DELETE',
		headers: {
			Authorization: `ApiKey ${process.env.ELASTIC_API_KEY}`,
		},
	});

	if (!res.ok) {
		console.warn(`Failed to delete post in Elasticsearch: ${res.statusText}`);
	}
}
