import { PostgresTableModel } from 'from-schema';
import { imageDraft } from '@lyku/bson-models';

export const imageDrafts = {
	indexes: ['author'],
	schema: imageDraft,
} as const satisfies PostgresTableModel<typeof imageDraft>;
