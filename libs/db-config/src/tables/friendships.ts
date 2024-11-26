import { TableModel } from 'from-schema';
import { friendship } from 'bson-models';

export const friendships = {
	indexes: ['users'],
	schema: friendship,
} as const satisfies TableModel<typeof friendship>;
