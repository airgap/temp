import { PostgresTableModel } from 'from-schema';
import { hashdoc } from '@lyku/bson-models';

export const userHashes = {
	indexes: ['username', 'email', 'hash'],
	schema: hashdoc,
} as const satisfies PostgresTableModel<typeof hashdoc>;
