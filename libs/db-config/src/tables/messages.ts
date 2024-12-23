import { PostgresTableModel } from 'from-schema';
import { message } from 'bson-models';

export const messages = {
	indexes: ['author', 'channel', 'sent'],
	schema: message,
} as const satisfies PostgresTableModel<typeof message>;
