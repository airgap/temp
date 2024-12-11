import { PostgresTableModel } from 'from-schema';
import { developer } from 'bson-models';

export const developers = {
  indexes: ['name'],
  schema: developer,
} as const satisfies PostgresTableModel<typeof developer>;
