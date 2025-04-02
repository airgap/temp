import type { TsonHandlerModel } from 'from-schema';
import { achievementGrant, game } from '@lyku/json-models';

export const listenForAchievementGrants = {
	request: {
		type: 'object',
		properties: {
			game: game.properties.id,
		},
		required: [],
	},
	response: { type: 'array', items: achievementGrant },
	stream: true,
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
