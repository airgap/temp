import { PostgresTableModel } from 'from-schema';
import { fileDraft } from 'bson-models';

export const fileDrafts = {
	indexes: ['creator', 'type', 'post', 'created', 'creator'],
	primaryKey: 'id',
	schema: fileDraft,
} as const satisfies PostgresTableModel<typeof fileDraft>;
