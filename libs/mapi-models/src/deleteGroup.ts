import type { TsonHandlerModel } from 'from-schema';
import { group } from '@lyku/json-models';

export const deleteGroup = {
	request: {
		type: 'object',
		properties: {
			id: group.properties.id,
		},
		required: ['id'],
	},
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
