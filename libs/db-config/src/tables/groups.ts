import { PostgresTableModel } from 'from-schema';
import { group } from 'bson-models';
import { groups as docs } from '@lyku/stock-docs';
export const groups = {
	indexes: ['name', 'owner', 'creator', 'created', 'private'],
	schema: group,
	docs: Object.values(docs),
} satisfies PostgresTableModel<typeof group>;
