import { PostgresTableModel } from 'from-schema';
import { videoDoc } from 'bson-models';

export const videos = {
	indexes: ['creator', 'id', 'post'],
	primaryKey: 'id',
	schema: videoDoc,
} as const satisfies PostgresTableModel<typeof videoDoc>;
