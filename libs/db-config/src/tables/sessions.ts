import { TableModel } from 'from-schema';
import { session } from 'bson-models';

export const sessions = {
	indexes: ['created', 'userId'],
	schema: session,
} as const satisfies TableModel<typeof session>;
