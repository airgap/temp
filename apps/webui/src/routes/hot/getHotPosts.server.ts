import type { Post } from '@lyku/json-models';
import { buildHotQuery, type DateRange } from '@lyku/helpers';

export async function queryHotPosts(opts: {
	ELASTIC_API_ENDPOINT: string;
	ELASTIC_API_KEY: string;
	fetch: any;
	dateRange?: DateRange;
	size?: number;
	continuation?: unknown[];
}): Promise<{ posts: Post[]; continuation?: unknown[] }> {
	const { dateRange, continuation } = opts ?? {};

	const body = buildHotQuery(opts);
	// const url = 'https://broke.lyku.org/posts/hot';

	const url = `${opts.ELASTIC_API_ENDPOINT}/posts-*/_search`;
	const auth = `ApiKey ${opts.ELASTIC_API_KEY}`;

	const headers = new Headers({
		'Content-Type': 'application/json',
		// 'User-Agent': 'Mozilla/5.0',
		Authorization: auth,
	});
	const res = await fetch(url, {
		method: 'POST',
		headers,
		body: JSON.stringify(body),
	});

	// const res = await fetch(url, {
	// 	method: 'POST',
	// 	headers: { 'Content-Type': 'application/json' },
	// 	body: JSON.stringify(body)
	// });
	if (!res.ok) throw new Error(`Elasticsearch query failed: ${res.statusText}`);

	const result = await res.json();
	// const result = await opts.proxy.list(body, opts.ELASTIC_API_ENDPOINT, opts.ELASTIC_API_KEY);
	const hits = result.hits?.hits ?? [];

	const posts: Post[] = hits.map((hit: any) => {
		const src = hit._source;
		return {
			id: BigInt(hit._id),
			body: src.body,
			bodyType: src.bodyType,
			echoes: BigInt(src.echoes),
			group: src.group ? BigInt(src.group) : undefined,
			hashtags: src.hashtags?.map(BigInt),
			author: BigInt(src.author),
			likes: BigInt(src.likes),
			loves: src.loves ? BigInt(src.loves) : undefined,
			publish: new Date(src.publish),
			replies: BigInt(src.replies),
			title: src.title,
			thread: src.thread?.map(BigInt),
			shortcode: src.shortcode,
			replyTo: src.replyTo ? BigInt(src.replyTo) : undefined,
			echoing: src.echoing ? BigInt(src.echoing) : undefined,
			attachments: src.attachments?.map(BigInt),
			updated: src.updated ? new Date(src.updated) : undefined,
		};
	});

	const lastHit = hits[hits.length - 1];
	const nextToken = lastHit?.sort ?? undefined;

	return { posts, continuation: nextToken };
}
