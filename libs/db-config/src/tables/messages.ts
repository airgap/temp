import { PostgresTableModel } from 'from-schema';
import { message } from '@lyku/bson-models';
import { updateUpdated } from '../updateUpdated';
export const messages = {
	indexes: ['author', 'channel', 'created'],
	schema: message,
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof message>;
