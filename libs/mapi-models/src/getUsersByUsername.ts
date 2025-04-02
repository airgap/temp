import type { TsonHandlerModel } from 'from-schema';
import { username, user } from '@lyku/json-models';

export const getUsersByUsername = {
	request: {
		type: 'object',
		properties: {
			users: {
				type: 'array',
				items: username,
			},
		},
		required: ['users'],
	},
	response: {
		type: 'object',
		properties: {
			users: {
				type: 'array',
				items: user,
			},
		},
		required: ['users'],
	},
	authenticated: false,
	throws: [400, 500],
} as const satisfies TsonHandlerModel;
