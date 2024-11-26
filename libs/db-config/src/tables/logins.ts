import { TableModel } from 'from-schema';
import { userLogin } from 'bson-models';

export const logins = {
	indexes: ['created', 'userId'],
	schema: userLogin,
} as const satisfies TableModel<typeof userLogin>;
