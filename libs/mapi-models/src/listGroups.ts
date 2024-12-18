import { TsonHandlerModel } from 'from-schema';
import { group } from '@lyku/json-models';
import { groupMembership, groupFilter } from '@lyku/json-models';

export const listGroups = {
	request: {
		type: 'object',
		properties: {
			filter: groupFilter,
			substring: group.properties.name,
		},
		required: [],
	},

	response: {
		type: 'object',
		properties: {
			groups: {
				type: 'array',
				items: group,
			},
			memberships: {
				type: 'array',
				items: groupMembership,
			},
		},
		required: ['groups', 'memberships'],
	},
	authenticated: true,
} as const satisfies TsonHandlerModel;
