import { PostgresTableModel } from 'from-schema';
import { friendRequest } from 'bson-models';

export const friendRequests = {
	indexes: ['from', 'to', 'created'],
	schema: friendRequest,
} as const satisfies PostgresTableModel<typeof friendRequest>;
