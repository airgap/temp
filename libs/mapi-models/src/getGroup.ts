import { HandlerModel } from 'from-schema';
import { group } from '@lyku/json-models';
import { groupMembership } from '@lyku/json-models';

export const getGroup = {
	request: group.properties.id,
	response: {
		type: 'object',
		properties: {
			group,
			membership: groupMembership,
		},
		required: ['group'],
	},
	authenticated: false,
} as const satisfies HandlerModel;
