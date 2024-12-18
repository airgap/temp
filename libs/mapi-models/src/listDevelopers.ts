import { jsonPrimitives } from 'from-schema';
import { developer } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

const { boolean, string } = jsonPrimitives;

export const listDevelopers = {
	request: {
		type: 'object',
		properties: {
			query: string,
			mine: boolean,
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
