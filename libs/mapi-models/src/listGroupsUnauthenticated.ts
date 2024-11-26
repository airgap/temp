import { HandlerModel, jsonPrimitives } from 'from-schema';
import { group } from '@lyku/json-models';
const { integer, string } = jsonPrimitives;

export const listGroupsUnauthenticated = {
	request: {
		type: 'object',
		properties: {
			substring: string,
			skip: integer,
			limit: integer,
		},
		required: [],
	},

	response: {
		type: 'array',
		items: group,
	},
	authenticated: false,
} as const satisfies HandlerModel;
