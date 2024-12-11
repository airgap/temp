import { PostgresTableModel } from 'from-schema';
import { imageDoc } from 'bson-models';

export const images = {
  // indexes: ['userId'],
  schema: imageDoc,
} satisfies PostgresTableModel<typeof imageDoc>;
