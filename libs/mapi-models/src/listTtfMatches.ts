import { ttfMatch } from '@lyku/json-models';
import type { TsonHandlerModel } from 'from-schema';

export const listTtfMatches = {
	request: {
		type: 'object',
		properties: {
			finished: { type: 'boolean' },
		},
		required: ['finished'],
	},

	response: {
		type: 'array',
		items: ttfMatch,
	},
	authenticated: true,
	throws: [400, 401, 500],
} as const satisfies TsonHandlerModel;
