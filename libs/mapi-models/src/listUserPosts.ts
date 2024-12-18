import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
import { group, post } from '@lyku/json-models';
const { number, uid } = jsonPrimitives;
import { username } from '@lyku/json-models';

export const listUserPosts = {
	request: {
		type: 'object',
		properties: {
			groups: {
				oneOf: [
					{
						type: 'array',
						items: group.properties.id,
					},
					true,
				],
			},
			tags: {
				type: 'array',
				items: uid,
			},
			before: number,
			user: username,
			// user: { enum: [uuid, username] },
		},
		required: ['user'],
	},
	response: {
		type: 'array',
		items: post,
	},
	authenticated: false,
} as const satisfies TsonHandlerModel;
