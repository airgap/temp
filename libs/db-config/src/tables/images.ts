import { PostgresTableModel } from 'from-schema';
import { imageDoc } from 'bson-models';

export const images = {
	indexes: ['uploader', 'uploaded', 'variants', 'draft', 'channel'],
	schema: imageDoc,
} satisfies PostgresTableModel<typeof imageDoc>;
