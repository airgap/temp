import type { TsonHandlerModel } from 'from-schema';
import { sessionId, email, password } from '@lyku/json-models';

export const loginUser = {
	request: {
		type: 'object',
		properties: {
			email,
			password,
		},
		required: ['email', 'password'],
	},
	response: {
		type: 'object',
		properties: {
			sessionId,
		},
		required: ['sessionId'],
	},
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
