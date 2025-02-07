import type { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

const listFeedFilter = {
	enum: ['users', 'groups', 'all'],
} as const;
export const listFeedPosts = {
	request: {
		type: 'object',
		properties: {
			groups: {
				oneOf: [
					{
						type: 'array',
						items: { type: 'bigint' },
					},
					true,
				],
			},
			authors: {
				oneOf: [
					{
						type: 'array',
						items: { type: 'bigint' },
					},
					true,
				],
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
	authenticated: true,
} as const satisfies TsonHandlerModel;
