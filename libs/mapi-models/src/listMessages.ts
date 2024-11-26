import { HandlerModel, jsonPrimitives } from 'from-schema';
import { message } from '@lyku/json-models';
const { uid } = jsonPrimitives;

export const listMessages = {
	request: {
		type: 'object',
		properties: {
			channel: uid,
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
} as const satisfies HandlerModel;
