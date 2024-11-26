import { HandlerModel, jsonPrimitives } from 'from-schema';
import { post } from '@lyku/json-models';

const { string } = jsonPrimitives;

export const finalizePost = {
	request: {
		type: 'object',
		properties: {
			id: string,
			body: string,
		},
		required: ['id'],
	},
	response: {
		type: 'object',
		properties: {
			error: string,
			post,
		},
		required: [],
	},
	authenticated: true,
} as const satisfies HandlerModel;
