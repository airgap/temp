import { PostgresTableModel } from 'from-schema';
import { btvGameStats } from 'bson-models';
import { updateUpdated } from '../updateUpdated';

export const btvStats = {
	indexes: [
		'user',
		'totalTime',
		'totalEdges',
		'totalCorners',
		'highestTime',
		'highestEdges',
		'highestCorners',
		'sessionCount',
		'currentCorners',
		'currentEdges',
		'currentTime',
	],
	primaryKey: ['user'],
	schema: btvGameStats,
	triggers: [
		updateUpdated,
	],
} satisfies PostgresTableModel<typeof btvGameStats>;
