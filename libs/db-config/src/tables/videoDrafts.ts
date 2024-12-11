import { PostgresTableModel } from 'from-schema';
import { videoDraft } from 'bson-models';

export const videoDrafts = {
  indexes: ['user'],
  schema: videoDraft,
} as const satisfies PostgresTableModel<typeof videoDraft>;
