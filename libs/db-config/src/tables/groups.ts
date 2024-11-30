import { TableModel } from 'from-schema';
import { Group, group } from 'bson-models';
import { users, groups as docs } from '@lyku/stock-docs';
export const groups = {
	indexes: ['name', 'slug', 'owner', 'creator', 'created', 'private'],
	schema: group,
	docs: Object.values(docs),
} satisfies TableModel<typeof group>;
