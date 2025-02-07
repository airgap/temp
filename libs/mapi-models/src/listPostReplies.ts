import type { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

export const listPostReplies = {
	request: {
		type: 'object',
		properties: {
			id: post.properties.id,
			tags: {
				type: 'array',
				items: post.properties.hashtags,
			},
			before: post.properties.published,
		},
		required: ['id'],
	},
	response: {
		type: 'array',
		items: post,
	},
	authenticated: true,
} as const satisfies TsonHandlerModel;
