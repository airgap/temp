import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
import { post } from '@lyku/json-models';
const { uid, number } = jsonPrimitives;

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
			before: number,
		},
		required: [],
	},
	response: { type: 'array', items: post },
	authenticated: true,
} as const satisfies TsonHandlerModel;
