import { HandlerModel } from 'from-schema';
import { groupMembership } from '@lyku/json-models';

export const getGroupMemberships = {
	request: { type: 'array', items: groupMembership.properties.id },
	response: {
		type: 'array',
		items: groupMembership,
	},
	authenticated: true,
} as const satisfies HandlerModel;
