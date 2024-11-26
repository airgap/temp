import { HandlerModel, jsonPrimitives } from 'from-schema';
import { publisher } from '@lyku/json-models';
const { string, boolean } = jsonPrimitives;

export const listDPublishers = {
	request: {
		type: 'object',
		properties: {
			query: string,
			mine: boolean,
		},
		required: [],
	},

	response: {
		type: 'object',
		properties: {
			games: {
				type: 'array',
				items: publisher,
			},
		},
		required: ['publishers'],
	},
	authenticated: false,
} as const satisfies HandlerModel;
