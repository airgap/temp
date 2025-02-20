import { PostgresTableModel } from 'from-schema';
import { groupMembership } from 'bson-models';

export const groupMemberships = {
	indexes: ['user', 'group', ['user', 'group']],
	schema: groupMembership,
} as const satisfies PostgresTableModel<typeof groupMembership>;
