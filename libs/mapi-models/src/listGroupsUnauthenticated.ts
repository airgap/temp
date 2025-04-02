import type { TsonHandlerModel } from 'from-schema';
import { group } from '@lyku/json-models';

export const listGroupsUnauthenticated = {
	request: {
		type: 'object',
		properties: {
			substring: { type: 'string', maxLength: 100 },
			skip: { type: 'integer', minimum: 0 },
			limit: { type: 'integer', minimum: 1, maximum: 200 },
		},
		required: [],
	},

	response: {
		type: 'array',
		items: group,
	},
	authenticated: false,
	throws: [400, 500],
} as const satisfies TsonHandlerModel;
