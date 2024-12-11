import { PostgresTableModel } from 'from-schema';
import { userFollow } from 'bson-models';

export const userFollows = {
  indexes: ['follower', 'followee', { bond: ['follower', 'followee'] }],
  schema: userFollow,
} as const satisfies PostgresTableModel<typeof userFollow>;
