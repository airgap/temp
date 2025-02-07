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
} as const satisfies TsonHandlerModel;
