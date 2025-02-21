import { PostgresTableModel } from 'from-schema';
import { friendRequest } from 'bson-models';
import { updateUpdated } from '../updateUpdated';

export const friendRequests = {
	indexes: ['from', 'to', 'created'],
	schema: friendRequest,
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof friendRequest>;
