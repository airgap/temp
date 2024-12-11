import { PostgresTableModel } from 'from-schema';
import { imageDraft } from 'bson-models';

export const imageDrafts = {
  indexes: ['user'],
  schema: imageDraft,
} as const satisfies PostgresTableModel<typeof imageDraft>;
