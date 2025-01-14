import { PostgresTableModel } from 'from-schema';
import { membershipList } from 'bson-models';
export const membershipLists = {
	schema: membershipList,
	indexes: ['user', 'groups', 'count'],
	primaryKey: 'user',
} as const satisfies PostgresTableModel<typeof membershipList>;
