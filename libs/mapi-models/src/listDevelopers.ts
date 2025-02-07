import type { TsonHandlerModel } from 'from-schema';
import { developer } from '@lyku/json-models';

export const listDevelopers = {
	request: {
		type: 'object',
		properties: {
			query: { type: 'string', maxLength: developer.properties.name.maxLength },
			mine: { type: 'boolean' },
		},
		required: [],
	},

	response: {
		type: 'object',
		properties: {
			games: {
				type: 'array',
				items: developer,
			},
		},
		required: ['developers'],
	},
	authenticated: false,
} as const satisfies TsonHandlerModel;
