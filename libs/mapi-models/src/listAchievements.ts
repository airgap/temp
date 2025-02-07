import type { TsonHandlerModel } from 'from-schema';
import { achievement, game } from '@lyku/json-models';

export const listAchievements = {
	request: {
		type: 'object',
		properties: {
			game: game.properties.id,
		},
		required: [],
	},

	response: {
		type: 'array',
		items: achievement,
	},
	authenticated: false,
} as const satisfies TsonHandlerModel;
