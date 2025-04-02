import type { TsonHandlerModel } from 'from-schema';
import { group } from '@lyku/json-models';

export const listGroupsICreated = {
	response: {
		type: 'array',
		items: group,
	},
	authenticated: true,
	throws: [400, 401, 500],
} as const satisfies TsonHandlerModel;
