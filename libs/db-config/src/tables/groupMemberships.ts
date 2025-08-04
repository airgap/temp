import { PostgresTableModel } from 'from-schema';
import { groupMembership } from '@lyku/bson-models';
import { updateUpdated } from '../updateUpdated';
export const groupMemberships = {
	indexes: ['user', 'group', ['user', 'group']],
	primaryKey: ['group', 'user'],
	schema: groupMembership,
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof groupMembership>;
