import { PostgresTableModel } from 'from-schema';
import { like } from 'bson-models';

export const likes = {
  indexes: ['userId', 'postId', { bond: ['userId', 'postId'] }],
  schema: like,
} as const satisfies PostgresTableModel<typeof like>;
