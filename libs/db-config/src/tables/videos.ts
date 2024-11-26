import { TableModel } from 'from-schema';
import { videoDoc } from 'bson-models';

export const videos = {
	indexes: ['author'],
	schema: videoDoc,
} as const satisfies TableModel<typeof videoDoc>;
