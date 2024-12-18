import { PostgresTableModel } from 'from-schema';
import { score } from 'bson-models';

export const scores = {
	indexes: [
		'posted',
		'user',
		'channel',
		// 'likes',
		'reports',
		'columns',
		'leaderboard',
		'game',
	],
	schema: score,
} as const satisfies PostgresTableModel<typeof score>;
