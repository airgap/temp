import { TsonHandlerModel } from 'from-schema';
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
} as const satisfies TsonHandlerModel;
