import type { TsonHandlerModel } from 'from-schema';
import { game } from '@lyku/json-models';

export const listGames = {
	request: {
		type: 'object',
		properties: {
			internal: { type: 'boolean', description: 'Only games made internally' },
			developer: { type: 'bigint' },
			hint: { type: 'string', maxLength: 100 },
			mine: { type: 'boolean' },
			publisher: { type: 'bigint' },
		},
		required: [],
	},

	response: {
		type: 'array',
		items: game,
	},
	authenticated: false,
} as const satisfies TsonHandlerModel;
