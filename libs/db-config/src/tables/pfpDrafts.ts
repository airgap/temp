import { PostgresTableModel } from 'from-schema';
import { pfpDraft } from 'bson-models';

export const pfpDrafts = {
	indexes: ['creator', 'type', 'created', 'creator'],
	primaryKey: 'id',
	schema: pfpDraft,
} as const satisfies PostgresTableModel<typeof pfpDraft>;
