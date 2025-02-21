import { PostgresTableModel } from 'from-schema';
import { groupMembership } from 'bson-models';
import { updateUpdated } from '../updateUpdated';
export const groupMemberships = {
	indexes: ['user', 'group', ['user', 'group']],
	schema: groupMembership,
	triggers: [
		updateUpdated,
	],
} as const satisfies PostgresTableModel<typeof groupMembership>;
