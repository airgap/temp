import { PostgresTableModel } from 'from-schema';
import { user } from 'bson-models';
import { users as docs } from '@lyku/stock-docs';
import { updateUpdated } from '../updateUpdated';

export const users = {
	indexes: [
		'lastLogin',
		// 'totalStreamTime',
		'username',
		// 'name',
		'bot',
		'staff',
		// 'lastSuper',
	],
	docs: Object.values(docs),
	schema: user,
	primaryKey: 'id',
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof user>;
