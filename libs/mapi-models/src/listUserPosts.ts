import { group, post, username } from '@lyku/json-models';
import type { TsonHandlerModel } from 'from-schema';

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
	throws: [400, 401, 500],
} as const satisfies TsonHandlerModel;
