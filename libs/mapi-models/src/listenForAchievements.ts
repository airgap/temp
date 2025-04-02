import type { TsonHandlerModel } from 'from-schema';
import { achievementGrant, achievement } from '@lyku/json-models';

export const listenForAchievements = {
	response: {
		type: 'object',
		properties: {
			grantedAchievement: achievementGrant,
			achievement,
		},
		required: ['grantedAchievement', 'achievement'],
	},
	stream: true,
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
