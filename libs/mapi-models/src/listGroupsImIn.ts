import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
import { group } from '@lyku/json-models';
import { groupMembership } from '@lyku/json-models';
const { uid } = jsonPrimitives;
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
