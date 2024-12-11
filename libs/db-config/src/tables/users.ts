import { PostgresTableModel } from 'from-schema';
import { user } from 'bson-models';
import { users as docs } from '@lyku/stock-docs';

export const users = {
  indexes: [
    'lastLogin',
    // 'totalStreamTime',
    'username',
    // 'name',
    'bot',
    'staff',
    // 'lastSuper',
  ],
  docs: Object.values(docs),
  schema: user,
  primaryKey: 'id',
} as const satisfies PostgresTableModel<typeof user>;
