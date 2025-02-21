import { PostgresTableModel } from 'from-schema';
import { group } from 'bson-models';
import { groups as docs } from '@lyku/stock-docs';
import { updateUpdated } from '../updateUpdated';
export const groups = {
	indexes: ['name', 'owner', 'creator', 'created', 'private', 'updated'],
	schema: group,
	// foreignKeys: {
	// 	owner: {
	// 		users: 'id',
	// 	},
	// 	creator: {
	// 		users: 'id',
	// 	},
	// },
	docs: Object.values(docs),
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof group>;
