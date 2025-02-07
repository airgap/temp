import type { TsonHandlerModel } from 'from-schema';
import { group, groupMembership } from '@lyku/json-models';

export const listGroupsImIn = {
	response: {
		type: 'object',
		properties: {
			groups: {
				type: 'array',
				items: group,
			},
			groupMemberships: {
				type: 'array',
				items: groupMembership,
			},
		},
		required: ['groups', 'groupMemberships'],
	},
	authenticated: true,
} as const satisfies TsonHandlerModel;
