import { EnumTsonSchema, TsonHandlerModel } from 'from-schema';
import { jsonPrimitives } from 'from-schema';
import { post } from '@lyku/json-models';
const { number, uid } = jsonPrimitives;

const listFeedFilter = {
	enum: ['users', 'groups', 'all'],
} as const satisfies EnumTsonSchema;
export const listenForFeedPosts = {
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
	stream: true,
	authenticated: true,
} as const satisfies TsonHandlerModel;
