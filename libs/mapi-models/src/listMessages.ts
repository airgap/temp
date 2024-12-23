import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
import { message } from '@lyku/json-models';
const { uid } = jsonPrimitives;

export const listMessages = {
	request: {
		type: 'object',
		properties: {
			channel: { type: 'bigint' },
		},
		required: ['channel'],
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
