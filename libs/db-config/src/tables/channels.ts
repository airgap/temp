import { PostgresTableModel } from 'from-schema';
import { channel } from 'bson-models';

export const channels = {
	indexes: ['name', 'slug', 'owner', 'totalStreamTime'],
	schema: channel,
} as const satisfies PostgresTableModel<typeof channel>;
