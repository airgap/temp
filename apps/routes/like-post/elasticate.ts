import type { Post } from '@lyku/json-models';

export async function elasticate(postId: bigint): Promise<void> {
	const url = `${process.env.ELASTIC_API_ENDPOINT}/posts/_update/${postId}`;
	const headers = new Headers({
		'Content-Type': 'application/json',
		Authorization: `ApiKey ${process.env.ELASTIC_API_KEY}`,
	});

	const updateScript = {
		script: {
			source:
				'ctx._source.likes = (ctx._source.likes.toLong() + 1).toString(); ctx._source.engagement_score = ctx._source.likes.toLong() + (ctx._source.loves?.toLong() || 0) * 10 + ctx._source.echoes.toLong() * 5',
			lang: 'painless',
		},
	};

	console.log('Updating likes for post', postId);

	const res = await fetch(url, {
		method: 'POST',
		headers,
		body: JSON.stringify(updateScript),
	});

	if (!res.ok) {
		throw new Error(
			`Failed to update likes in Elasticsearch: ${res.statusText}`,
		);
	}
}
