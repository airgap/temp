import type { TsonHandlerModel } from 'from-schema';
import { group, groupName } from '@lyku/json-models';

export const updateGroup = {
	request: {
		type: 'object',
		properties: {
			id: { type: 'bigint' },
			name: groupName,
			private: { type: 'boolean' },
		},
		minProperties: 2,
		required: ['id'],
	},
	response: group,
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
