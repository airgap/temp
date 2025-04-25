import type { ScoredPost } from '@lyku/json-models';

export const delasticatePost = (hit: any): ScoredPost => {
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
		score: src._score,
		created: new Date(src.created),
	};
};
