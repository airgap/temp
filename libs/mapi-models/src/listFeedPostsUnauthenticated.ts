import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
import { post } from '@lyku/json-models';
const { uid, number } = jsonPrimitives;

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
				items: uid,
			},
			before: number,
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
} as const satisfies TsonHandlerModel;
