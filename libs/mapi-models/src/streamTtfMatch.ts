import { ttfMatch } from '@lyku/json-models';
import { HandlerModel, jsonPrimitives } from 'from-schema';
const { uid } = jsonPrimitives;

export const streamTtfMatch = {
	request: {
		type: 'object',
		properties: {
			id: uid,
		},
		required: ['id'],
	},
	response: {
		type: 'object',
		properties: {
			match: ttfMatch,
		},
	},
	authenticated: true,
	stream: true,
} as const satisfies HandlerModel;
