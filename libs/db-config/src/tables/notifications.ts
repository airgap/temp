import { PostgresTableModel } from 'from-schema';
import { notification } from 'bson-models';

export const notifications = {
	indexes: ['user', 'title', 'subtitle', 'body', 'icon', 'href', 'posted'],
	schema: notification,
} as const satisfies PostgresTableModel<typeof notification>;
