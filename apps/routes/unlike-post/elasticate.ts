export async function elasticate(postId: bigint): Promise<void> {
	const url = `${process.env.ELASTIC_API_ENDPOINT}/posts/_update/${postId}`;
	const headers = new Headers({
		'Content-Type': 'application/json',
		Authorization: `ApiKey ${process.env.ELASTIC_API_KEY}`,
	});

	const updateScript = {
		script: {
			source: `
				ctx._source.likes = (ctx._source.likes ?: 0) - 1;
			`,
			lang: 'painless',
		},
	};
	/*
ctx._source.engagement_score = 
					(ctx._source.likes ?: 0) +
					(ctx._source.loves ?: 0) * 10 +
					(ctx._source.echoes ?: 0) * 5;*/
	console.log('Updating likes for post', postId);

	const res = await fetch(url, {
		method: 'POST',
		headers,
		body: JSON.stringify(updateScript),
	});

	if (!res.ok) {
		const errorBody = await res.text();
		throw new Error(
			`Failed to update likes in Elasticsearch: ${res.statusText}\nDetails: ${errorBody}`,
		);
	}
}
