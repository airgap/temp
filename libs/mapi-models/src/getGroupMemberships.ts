import type { TsonHandlerModel } from 'from-schema';
import { groupMembership } from '@lyku/json-models';

export const getGroupMemberships = {
	request: { type: 'array', items: groupMembership.properties.id },
	response: {
		type: 'array',
		items: groupMembership,
	},
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
