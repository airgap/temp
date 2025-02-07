import type { TsonHandlerModel } from 'from-schema';
import { game, achievementGrant } from '@lyku/json-models';

export const listAchievementGrants = {
	request: {
		type: 'object',
		properties: {
			game: game.properties.id,
		},
		required: [],
	},

	response: {
		type: 'array',
		items: achievementGrant,
	},
	authenticated: true,
} as const satisfies TsonHandlerModel;
