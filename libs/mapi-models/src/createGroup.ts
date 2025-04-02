import type { TsonHandlerModel } from 'from-schema';
import { group } from '@lyku/json-models';

export const createGroup = {
	request: {
		type: 'object',
		properties: {
			name: group.properties.name,
			slug: group.properties.slug,
			private: { type: 'boolean' },
		},
		required: ['name', 'slug', 'private'],
	},
	response: group,
	authenticated: true,
	throws: [400, 401, 409, 500],
} as const satisfies TsonHandlerModel;
