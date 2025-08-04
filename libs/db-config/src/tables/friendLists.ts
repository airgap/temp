import { PostgresTableModel } from 'from-schema';
import { friendList } from '@lyku/bson-models';
import { updateUpdated } from '../updateUpdated';
export const friendLists = {
	schema: friendList,
	indexes: ['user', 'friends', 'count', 'created', 'updated'],
	primaryKey: 'user',
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof friendList>;
