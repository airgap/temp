import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
import { like, user, post } from '@lyku/json-models';
const { number, uid } = jsonPrimitives;

export const listHotPosts = {
	request: {
		type: 'object',
		properties: {
			groups: {
				type: 'array',
				items: uid,
			},
			tags: {
				type: 'array',
				items: uid,
			},
			before: number,
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
