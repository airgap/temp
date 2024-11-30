import { TableModel } from 'from-schema';
import { user } from 'bson-models';
import {users as docs} from '@lyku/stock-docs';

export const users = {
	indexes: [
		'lastLogin',
		// 'totalStreamTime',
		'username',
		// 'name',
		'bot',
		'staff',
		'ownerId',
		'lastSuper',
	],
	docs: Object.values(docs),
	schema: user,
} as const satisfies TableModel<typeof user>;
