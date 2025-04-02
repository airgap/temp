import type { TsonHandlerModel } from 'from-schema';
import { message } from '@lyku/json-models';

export const listMessages = {
	request: {
		type: 'object',
		properties: {
			channel: { type: 'bigint' },
		},
		required: [],
	},
	response: {
		type: 'object',
		properties: {
			messages: {
				type: 'array',
				items: message,
			},
		},
		required: ['messages'],
	},
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
