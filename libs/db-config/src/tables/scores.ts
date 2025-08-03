import { PostgresTableModel } from 'from-schema';
import { score } from 'bson-models';
import { updateUpdated } from '../updateUpdated';
export const scores = {
	indexes: [
		'created',
		'updated',
		'user',
		'channel',
		// 'likes',
		'reports',
		'columns',
		'leaderboard',
		'game',
		// Compound indexes for leaderboard optimization
		['leaderboard', 'user'],
		['leaderboard', 'user', 'created'],
	],
	schema: score,
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof score>;
