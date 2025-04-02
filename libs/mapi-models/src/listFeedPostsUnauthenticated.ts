import type { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

export const listFeedPostsUnauthenticated = {
	request: {
		type: 'object',
		properties: {
			groups: {
				type: 'array',
				items: { type: 'bigint' },
			},
			authors: {
				type: 'array',
				items: { type: 'bigint' },
			},
			tags: {
				type: 'array',
				items: { type: 'string' },
			},
			before: { type: 'date' },
			count: {
				type: 'integer',
				minimum: 1,
				maximum: 100,
				default: 20,
			},
		},
		required: [],
	},
	response: { type: 'array', items: post },
	authenticated: false,
	throws: [400, 500],
} as const satisfies TsonHandlerModel;
