import type { TsonHandlerModel } from 'from-schema';
import { group, groupMembership } from '@lyku/json-models';

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
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
