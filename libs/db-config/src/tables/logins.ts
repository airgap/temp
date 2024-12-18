import { PostgresTableModel } from 'from-schema';
import { userLogin } from 'bson-models';

export const logins = {
	indexes: ['created', 'userId'],
	schema: userLogin,
} as const satisfies PostgresTableModel<typeof userLogin>;
