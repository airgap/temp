import type { TsonHandlerModel } from 'from-schema';
import { like, user, post } from '@lyku/json-models';

export const listHotPosts = {
	request: {
		type: 'object',
		properties: {
			groups: {
				type: 'array',
				items: { type: 'bigint' },
			},
			tags: {
				type: 'array',
				items: { type: 'bigint' },
			},
			before: { type: 'date' },
			limit: {
				type: 'integer',
				minimum: 1,
				maximum: 100,
			},
		},
		required: [],
	},
	response: {
		type: 'object',
		properties: {
			posts: { type: 'array', items: post },
			authors: { type: 'array', items: user },
			likes: { type: 'array', items: like },
		},
	},
	authenticated: false,
} as const satisfies TsonHandlerModel;
