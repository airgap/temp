import { PostgresTableModel } from 'from-schema';
import { postDraft } from 'bson-models';

export const postDrafts = {
	indexes: ['author'],
	schema: postDraft,
} as const satisfies PostgresTableModel<typeof postDraft>;
