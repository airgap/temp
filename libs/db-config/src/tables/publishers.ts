import { PostgresTableModel } from 'from-schema';
import { publisher } from 'bson-models';
import { updateUpdated } from '../updateUpdated';
export const publishers = {
	indexes: ['name'],
	schema: publisher,
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof publisher>;
