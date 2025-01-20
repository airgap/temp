import { PostgresTableModel } from 'from-schema';
import { btvGameStats } from 'bson-models';

export const btvStats = {
	indexes: ['user'],
	primaryKey: ['user'],
	schema: btvGameStats,
} satisfies PostgresTableModel<typeof btvGameStats>;
