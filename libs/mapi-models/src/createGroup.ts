import { HandlerModel, jsonPrimitives } from 'from-schema';
import { group } from '@lyku/json-models';
import { groupName } from '@lyku/json-models';
import { groupSlug } from '@lyku/json-models';

export const createGroup = {
	request: {
		type: 'object',
		properties: {
			name: groupName,
			slug: groupSlug,
			private: jsonPrimitives.boolean,
		},
		required: ['name', 'slug', 'private'],
	},
	response: group,
	authenticated: true,
} as const satisfies HandlerModel;
