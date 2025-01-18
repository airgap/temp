import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
import { group } from '@lyku/json-models';
import { groupMembership } from '@lyku/json-models';
const { uid } = jsonPrimitives;
export const listGroupsIOwn = {
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
} as const satisfies TsonHandlerModel;
