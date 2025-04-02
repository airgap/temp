import type { TsonHandlerModel } from 'from-schema';
import { username, user } from '@lyku/json-models';

export const createBot = {
	request: {
		type: 'object',
		properties: {
			username,
		},
		required: ['username'],
	},
	response: user.properties.id,
	authenticated: true,
	throws: [400, 401, 409, 500],
} as const satisfies TsonHandlerModel;
