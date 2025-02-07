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
} as const satisfies TsonHandlerModel;
