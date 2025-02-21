import { PostgresTableModel } from 'from-schema';
import { leaderboard } from 'bson-models';
import { updateUpdated } from '../updateUpdated';
export const leaderboards = {
	indexes: ['game', 'owner', 'created', 'updated', 'creator'],
	schema: leaderboard,
	triggers: [
		updateUpdated,
	],
} as const satisfies PostgresTableModel<typeof leaderboard>;
