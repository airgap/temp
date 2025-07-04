import type { TsonHandlerModel } from 'from-schema';
import { fileDoc, user, post } from '@lyku/json-models';
import { reactions } from '@lyku/helpers';

export const listHotPosts = {
	request: {
		type: 'object',
		properties: {
			page: {
				type: 'integer',
				minimum: 1,
				maximum: 4,
			},
		},
	},
	response: {
		type: 'object',
		properties: {
			posts: { type: 'array', items: post },
			users: { type: 'array', items: user },
			reactions: {
				type: 'object',
				patternProperties: {
					'^[0-9]{0,20}$': { enum: reactions },
				},
			},

			friends: {
				type: 'array',
				items: {
					type: 'bigint',
				},
			},
			followees: {
				type: 'array',
				items: {
					type: 'bigint',
				},
			},
			followers: {
				type: 'array',
				items: {
					type: 'bigint',
				},
			},
			files: {
				type: 'array',
				items: fileDoc,
			},
		},
	},
	authenticated: false,
	throws: [400, 404, 500],
} as const satisfies TsonHandlerModel;
