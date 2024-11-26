import { TableModel } from 'from-schema';
import { hashdoc } from 'bson-models';

export const userHashes = {
	indexes: ['username', 'email'],
	schema: hashdoc,
} as const satisfies TableModel<typeof hashdoc>;
