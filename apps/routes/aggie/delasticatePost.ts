import type { BodyType, ScoredPost, Thread } from '@lyku/json-models';
type HotHit = {
	_index: string;
	_id: string;
	_score: number;
	_source: {
		id: string;
		body: string | null;
		bodyType: string | null;
		echoes: string | bigint;
		group?: string | bigint | null;
		author: string | bigint;
		likes: string | bigint;
		publish: string;
		replies: string | bigint;
		title: string | null;
		shortcode: null;
		attachments: bigint[] | string[];
		updated: string;
		engagement_score: number;
		hashtags?: string[] | number[];
		loves?: string | bigint | null;
		thread?: (string | bigint)[];
		replyTo?: string;
		echoing?: string;
		created?: string;
	};
	sort: [number, number];
};
export const delasticatePost = (hit: HotHit): ScoredPost => {
	const src = hit._source;
	// console.log('hit', stringifyBON(hit));
	// console.log('source', stringifyBON(hit._source));
	// console.log('echoes', typeof src.echoes);
	// console.log('hashtags', typeof src.hashtags);
	// console.log('author', typeof src.author);
	return Object.fromEntries(
		Object.entries({
			id: BigInt(hit._id),
			body: src.body ?? undefined,
			bodyType: (src.bodyType as BodyType) ?? undefined,
			echoes: BigInt(src.echoes),
			group: src.group ? BigInt(src.group) : undefined,
			hashtags: src.hashtags?.map(BigInt),
			author: BigInt(src.author),
			likes: BigInt(src.likes),
			loves: src.loves ? BigInt(src.loves) : 0n,
			publish: new Date(src.publish),
			replies: BigInt(src.replies),
			title: src.title ?? undefined,
			thread: src.thread?.map(BigInt),
			shortcode: src.shortcode ?? undefined,
			replyTo: src.replyTo ? BigInt(src.replyTo) : undefined,
			echoing: src.echoing ? BigInt(src.echoing) : undefined,
			attachments: src.attachments?.map(BigInt),
			updated: src.updated ? new Date(src.updated) : undefined,
			score: hit._score,
			created: new Date(src.created ?? 0),
		}).filter(([, v]) => typeof v !== 'undefined'),
	);
};
