import { TableModel } from 'from-schema';
import { groupMembership } from 'bson-models';

export const groupMemberships = {
	indexes: ['user', 'group', { bond: ['user', 'group'] }],
	schema: groupMembership,
} as const satisfies TableModel<typeof groupMembership>;
