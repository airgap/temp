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
} as const satisfies TsonHandlerModel;
