import type { Post, Thread } from '@lyku/json-models';
import {
	buildBackthreadQuery,
	buildHotQuery,
	type DateRange,
} from '@lyku/helpers';
import { delasticatePost } from './delasticatePost';
import { stringifyBON } from 'from-schema';

export async function queryHotPosts(opts: {
	ELASTIC_API_ENDPOINT: string;
	ELASTIC_API_KEY: string;
	fetch: any;
	dateRange?: DateRange;
	size?: number;
	continuation?: unknown[];
}): Promise<{ posts: Post[]; continuation?: unknown[] }> {
	console.log('Querying hot posts');
	const { dateRange, continuation } = opts ?? {};

	const body = buildHotQuery(opts);
	// const url = 'https://broke.lyku.org/posts/hot';

	const url = `${opts.ELASTIC_API_ENDPOINT}/posts-*/_search`;
	// console.log('uuuh', opts.ELASTIC_API_ENDPOINT);
	const auth = `ApiKey ${opts.ELASTIC_API_KEY}`;
	// console.log('body', JSON.stringify(body));
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
	if (!res.ok)
		throw new Error(`Elasticsearch query failed: ${typeof res.statusText}`);
	const result = await res.json();
	// const result = await opts.proxy.list(body, opts.ELASTIC_API_ENDPOINT, opts.ELASTIC_API_KEY);
	const hits = result.hits?.hits ?? [];
	const hotPosts: Post[] = hits.map(delasticatePost);
	const responses = await fetch(`${opts.ELASTIC_API_ENDPOINT}/_msearch`, {
		method: 'POST',
		body:
			buildBackthreadQuery(
				hotPosts.map((p) => ({ id: p.id, score: (p as any).score })),
			)
				.map((item) => {
					return stringifyBON(item);
				})
				.join('\n') + '\n',
	}).then(async (res) => {
		const j = await res.json();
		return j;
	});

	const posts: Post[] = [];
	const threads: Thread[] = [];

	for (let i = 0; i < hotPosts.length; i++) {
		const focus = hotPosts[i];
		const replyHit = responses[i]?.hits?.hits?.[0];
		posts.push(focus);

		if (replyHit) {
			const reply = delasticatePost(replyHit);
			posts.push(reply);

			threads.push({
				focus: focus.id,
				replies: [reply.id],
				replyTo: focus.replyTo, // optional chaining
			});
		} else {
			threads.push({
				focus: focus.id,
				replyTo: focus.replyTo,
			});
		}
	}

	const lastHit = hits[hits.length - 1];
	const nextToken = lastHit?.sort ?? undefined;

	return { posts: hotPosts, continuation: nextToken };
}
