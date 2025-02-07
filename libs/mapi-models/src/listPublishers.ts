import type { TsonHandlerModel } from 'from-schema';
import { publisher } from '@lyku/json-models';

export const listDPublishers = {
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
} as const satisfies TsonHandlerModel;
