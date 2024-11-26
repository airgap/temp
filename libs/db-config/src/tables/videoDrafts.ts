import { TableModel } from 'from-schema';
import { videoDraft } from 'bson-models';

export const videoDrafts = {
	indexes: ['userId'],
	schema: videoDraft,
} as const satisfies TableModel<typeof videoDraft>;
