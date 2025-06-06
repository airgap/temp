import { PostgresTableModel } from 'from-schema';
import { videoDraft } from 'bson-models';

export const videoDrafts = {
	indexes: ['creator'],
	primaryKey: 'id',
	schema: videoDraft,
} as const satisfies PostgresTableModel<typeof videoDraft>;
