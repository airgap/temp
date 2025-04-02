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
			before: post.properties.publish,
		},
		required: ['id'],
	},
	response: {
		type: 'array',
		items: post,
	},
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
