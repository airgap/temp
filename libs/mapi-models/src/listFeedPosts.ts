import { HandlerModel, jsonPrimitives } from 'from-schema';
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
						items: uid,
					},
					true,
				],
			},
			tags: {
				type: 'array',
				items: uid,
			},
			filter: listFeedFilter,
			before: number,
		},
		required: [],
	},
	response: { type: 'array', items: post },
	authenticated: true,
} as const satisfies HandlerModel;
