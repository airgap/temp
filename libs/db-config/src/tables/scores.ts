import { PostgresTableModel } from 'from-schema';
import { score } from 'bson-models';
import { updateUpdated } from '../updateUpdated';
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
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof score>;
