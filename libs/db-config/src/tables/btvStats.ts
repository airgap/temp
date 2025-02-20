import { PostgresTableModel } from 'from-schema';
import { btvGameStats } from 'bson-models';

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
} satisfies PostgresTableModel<typeof btvGameStats>;
