import type { TsonHandlerModel } from 'from-schema';
import { group } from '@lyku/json-models';

export const getGroups = {
	request: {
		type: 'array',
		items: {
			oneOf: [
				{
					type: 'bigint',
				},
				{ type: 'string' },
			],
		},
	},
	response: {
		type: 'object',
		properties: {
			groups: {
				type: 'array',
				items: group,
			},
		},
	},
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
