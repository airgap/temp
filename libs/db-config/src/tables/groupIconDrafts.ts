import { PostgresTableModel } from 'from-schema';
import { groupIconDraft } from '@lyku/bson-models';

export const groupIconDrafts = {
	indexes: ['creator', 'type', 'created', 'creator', 'group'],
	primaryKey: 'id',
	schema: groupIconDraft,
} as const satisfies PostgresTableModel<typeof groupIconDraft>;
