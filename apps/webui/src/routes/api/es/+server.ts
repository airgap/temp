import { json } from '@sveltejs/kit';
import { ELASTIC_CONNECTION_STRING } from '$env/static/private';

export const POST = async ({ request }) => {
	const body = await request.json();

	const res = await fetch(`${ELASTIC_CONNECTION_STRING}/posts-*/_search`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			// Authorization: `ApiKey ${ELASTIC_API_KEY}`,
		},
		body: JSON.stringify(body),
	});

	if (!res.ok) {
		return new Response(`Elasticsearch error: ${res.statusText}`, {
			status: 500,
		});
	}

	const data = await res.json();
	return json(data);
};
