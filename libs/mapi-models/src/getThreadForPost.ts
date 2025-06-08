import {
	group,
	post,
	user,
	username,
	reaction,
	friendshipStatus,
	thread,
	fileDoc,
} from '@lyku/json-models';
import type { TsonHandlerModel } from 'from-schema';

export const getThreadForPost = {
	request: { type: 'bigint' },
	response: {
		type: 'object',
		properties: {
			thread,
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
			files: {
				type: 'array',
				items: fileDoc,
			},
		},
	},
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
