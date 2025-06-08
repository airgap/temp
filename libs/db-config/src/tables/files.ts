import { PostgresTableModel } from 'from-schema';
import { fileDoc } from 'bson-models';

export const files = {
	indexes: ['creator', 'id', 'post'],
	primaryKey: 'id',
	schema: fileDoc,
} as const satisfies PostgresTableModel<typeof fileDoc>;
