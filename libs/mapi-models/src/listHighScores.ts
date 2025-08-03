import type { TsonHandlerModel } from 'from-schema';
import { score, user, leaderboard } from '@lyku/json-models';

export const listHighScores = {
	request: {
		type: 'object',
		properties: {
			leaderboard: {
				type: 'bigint',
			},
			sortColumnIndex: {
				type: 'number',
				minimum: 0,
				maximum: 10,
			},
			sortDirection: {
				enum: ['asc', 'desc'],
			},
			frameSize: {
				enum: ['hour', 'day', 'week', 'month', 'quarter', 'year'],
				description: 'Size of the time frame',
			},
			framePoint: {
				type: 'string',
				format: 'date-time',
				description:
					'Rough point in time to get the frame of (defaults to now)',
			},
		},
		required: ['leaderboard'],
	},
	response: {
		type: 'object',
		properties: {
			leaderboards: { type: 'array', items: leaderboard },
			scores: { type: 'array', items: score },
			users: { type: 'array', items: user },
		},
		required: ['scores', 'users', 'leaderboards'],
	},
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
