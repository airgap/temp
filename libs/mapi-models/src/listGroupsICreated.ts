import { HandlerModel } from 'from-schema';
import { group } from '@lyku/json-models';

export const listGroupsICreated = {
	request: {
		type: 'object',
		properties: {},
		required: [],
	},

	response: {
		type: 'array',
		items: group,
	},
	authenticated: true,
} as const satisfies HandlerModel;
