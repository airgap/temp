import { group, post, username } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

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
				items: { type: 'bigint' },
			},
			before: { type: 'bigint' },
			user: { oneOf: [username, { type: 'bigint' }] },
		},
		required: ['user'],
	},
	response: {
		type: 'array',
		items: post,
	},
	authenticated: false,
} as const satisfies TsonHandlerModel;
