import { PostgresTableModel } from 'from-schema';
import { leaderboard } from '@lyku/bson-models';
import { updateUpdated } from '../updateUpdated';
export const leaderboards = {
	indexes: [
		'game',
		'owner',
		'created',
		'updated',
		'creator',
		'columnNames',
		'columnFormats',
	],
	schema: leaderboard,
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof leaderboard>;
