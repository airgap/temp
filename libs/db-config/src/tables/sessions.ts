import { PostgresTableModel } from 'from-schema';
import { session } from 'bson-models';

export const sessions = {
	indexes: ['created', 'userId'],
	schema: session,
} as const satisfies PostgresTableModel<typeof session>;
