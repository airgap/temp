import { PostgresTableModel } from 'from-schema';
import { membershipList } from 'bson-models';
import { updateUpdated } from '../updateUpdated';
export const membershipLists = {
	schema: membershipList,
	indexes: ['user', 'groups', 'count', 'updated'],
	primaryKey: 'user',
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof membershipList>;
