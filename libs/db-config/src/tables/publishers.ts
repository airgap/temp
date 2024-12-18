import { PostgresTableModel } from 'from-schema';
import { publisher } from 'bson-models';

export const publishers = {
	indexes: ['name'],
	schema: publisher,
} as const satisfies PostgresTableModel<typeof publisher>;
