import { PostgresTableModel } from 'from-schema';
import { imageDoc } from 'bson-models';
import { updateUpdated } from '../updateUpdated';

export const images = {
	indexes: ['uploader', 'uploaded', 'variants', 'draft', 'channel'],
	schema: imageDoc,
	triggers: [updateUpdated],
} satisfies PostgresTableModel<typeof imageDoc>;
