import { user } from '@lyku/json-models';
import { ttfMatch } from '@lyku/json-models';
import { HandlerModel, jsonPrimitives } from 'from-schema';
const { boolean } = jsonPrimitives;

export const listTtfMatches = {
	request: {
		type: 'object',
		properties: {
			finished: boolean,
		},
		required: ['finished'],
	},

	response: {
		type: 'object',
		properties: {
			matches: {
				type: 'array',
				items: ttfMatch,
			},
			users: {
				type: 'array',
				items: user,
			},
		},
		required: ['matches', 'users'],
	},
	authenticated: false,
} as const satisfies HandlerModel;
