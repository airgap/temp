import {
	group,
	post,
	user,
	username,
	reaction,
	friendshipStatus,
} from '@lyku/json-models';
import type { TsonHandlerModel } from 'from-schema';

export const listUserPostsWithMeta = {
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
		type: 'object',
		properties: {
			posts: {
				type: 'array',
				items: post,
			},
			users: {
				type: 'array',
				items: user,
			},
			reactions: {
				type: 'array',
				items: reaction,
			},
			friendships: {
				type: 'array',
				items: friendshipStatus,
			},
			followers: {
				type: 'array',
				items: { type: 'bigint' },
			},
			followees: {
				type: 'array',
				items: { type: 'bigint' },
			},
		},
	},
	authenticated: false,
	throws: [400, 401, 500],
} as const satisfies TsonHandlerModel;
