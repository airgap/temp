import { user } from '@lyku/json-models';
import { ttfMatch } from '@lyku/json-models';
import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
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
		type: 'array',
		items: ttfMatch,
	},
	authenticated: true,
} as const satisfies TsonHandlerModel;
