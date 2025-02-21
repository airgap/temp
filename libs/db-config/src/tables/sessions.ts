import { PostgresTableModel } from 'from-schema';
import { session } from 'bson-models';
import { updateUpdated } from '../updateUpdated';

export const sessions = {
	indexes: ['created', 'userId'],
	schema: session,
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof session>;
