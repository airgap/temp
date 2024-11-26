import { gameSession } from './gameSession';

export const gameStats = {
	type: 'object',
	properties: {
		total: gameSession,
		current: gameSession,
		highest: gameSession,
		sessionCount: {
			type: 'number',
			minimum: 0,
		},
	},
	required: ['total', 'current', 'highest', 'sessionCount'],
} as const;
