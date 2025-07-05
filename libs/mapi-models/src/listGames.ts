import type { TsonHandlerModel } from 'from-schema';
import { developer, game, publisher } from '@lyku/json-models';

export const listGames = {
	request: {
		type: 'object',
		properties: {
			internal: { type: 'boolean', description: 'Only games made internally' },
			developer: { type: 'integer' },
			hint: { type: 'string', maxLength: 100 },
			mine: { type: 'boolean' },
			publisher: { type: 'integer' },
		},
		required: [],
	},

	response: {
		type: 'object',
		properties: {
			games: {
				type: 'array',
				items: game,
			},
			developers: {
				type: 'array',
				items: developer,
			},
			publishers: {
				type: 'array',
				items: publisher,
			},
		},
	},
	authenticated: false,
	throws: [400, 401, 500],
} as const satisfies TsonHandlerModel;
