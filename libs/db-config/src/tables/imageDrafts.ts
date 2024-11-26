import { TableModel } from 'from-schema';
import { imageDraft } from 'bson-models';

export const imageDrafts = {
	indexes: ['userId'],
	schema: imageDraft,
} satisfies TableModel<typeof imageDraft>;
