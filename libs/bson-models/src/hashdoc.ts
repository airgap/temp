import { PostgresRecordModel } from 'from-schema';
import { username } from './username';
import { user } from './user';

export const hashdoc = {
  properties: {
    email: { type: 'text' },
    hash: { type: 'text' },
    id: { type: 'bigint' },
    username,
  },
  required: ['email', 'hash', 'id', 'username'],
} as const satisfies PostgresRecordModel;
