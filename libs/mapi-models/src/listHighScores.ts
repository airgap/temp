import type { TsonHandlerModel } from 'from-schema';
import { score } from '@lyku/json-models';

export const listHighScores = {
	request: {
		type: 'object',
		properties: {
			leaderboard: {
				type: 'bigint',
			},
		},
		required: ['leaderboard'],
	},
	response: { type: 'array', items: score },
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
