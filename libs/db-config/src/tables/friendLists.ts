import { PostgresTableModel } from 'from-schema';
import { friendList } from 'bson-models';
export const friendLists = {
	schema: friendList,
	indexes: ['user', 'friends', 'count', 'created', 'updated'],
	primaryKey: 'user',
} as const satisfies PostgresTableModel<typeof friendList>;
