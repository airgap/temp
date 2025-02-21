import { PostgresTableModel } from 'from-schema';
import { notification } from 'bson-models';
import { updateUpdated } from '../updateUpdated';

export const notifications = {
	indexes: ['user', 'title', 'subtitle', 'body', 'icon', 'href', 'posted'],
	schema: notification,
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof notification>;
