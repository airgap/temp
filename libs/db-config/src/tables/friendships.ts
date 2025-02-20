import { PostgresTableModel } from 'from-schema';
import { friendship } from 'bson-models';

export const friendships = {
	indexes: ['users', 'created'],
	schema: friendship,
} as const satisfies PostgresTableModel<typeof friendship>;
