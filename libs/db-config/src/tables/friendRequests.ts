import { TableModel } from 'from-schema';
import { friendRequest } from 'bson-models';

export const friendRequests = {
	indexes: ['from', 'to'],
	schema: friendRequest,
} as const satisfies TableModel<typeof friendRequest>;
