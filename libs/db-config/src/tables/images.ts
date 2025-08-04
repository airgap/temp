import { PostgresTableModel } from 'from-schema';
import { imageDoc } from '@lyku/bson-models';

export const images = {
	indexes: ['uploader', 'created', 'variants', 'channel'],
	schema: imageDoc,
} satisfies PostgresTableModel<typeof imageDoc>;
