import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
import { group, groupName } from '@lyku/json-models';
const { boolean, uid } = jsonPrimitives;

export const updateGroup = {
	request: {
		type: 'object',
		properties: {
			id: { type: 'bigint' },
			name: groupName,
			private: boolean,
		},
		minProperties: 2,
		required: ['id'],
	},
	response: group,
	authenticated: true,
} as const satisfies TsonHandlerModel;
