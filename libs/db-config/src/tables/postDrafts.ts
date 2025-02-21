import { PostgresTableModel } from 'from-schema';
import { postDraft } from 'bson-models';
import { updateUpdated } from '../updateUpdated';
export const postDrafts = {
	indexes: ['author'],
	schema: postDraft,
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof postDraft>;
