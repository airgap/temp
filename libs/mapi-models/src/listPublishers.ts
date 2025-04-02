import type { TsonHandlerModel } from 'from-schema';
import { publisher } from '@lyku/json-models';

export const listPublishers = {
	request: {
		type: 'object',
		properties: {
			query: { type: 'string' },
			mine: { type: 'boolean' },
		},
		required: [],
	},

	response: {
		type: 'object',
		properties: {
			publishers: {
				type: 'array',
				items: publisher,
			},
		},
		required: ['publishers'],
	},
	authenticated: false,
	throws: [400, 500],
} as const satisfies TsonHandlerModel;
