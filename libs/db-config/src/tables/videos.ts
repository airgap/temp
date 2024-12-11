import { PostgresTableModel } from 'from-schema';
import { cloudflareVideoDoc } from 'bson-models';

export const videos = {
  indexes: ['author'],
  schema: cloudflareVideoDoc,
} as const satisfies PostgresTableModel<typeof cloudflareVideoDoc>;
