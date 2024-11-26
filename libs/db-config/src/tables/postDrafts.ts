import { TableModel } from 'from-schema';
import { postDraft } from 'bson-models';

export const postDrafts = {
	indexes: ['authorId'],
	schema: postDraft,
} as const satisfies TableModel<typeof postDraft>;
