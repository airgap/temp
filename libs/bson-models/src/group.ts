import { groupName } from './groupName';
import { PostgresRecordModel } from 'from-schema';

export const group = {
  properties: {
    id: {
      type: 'varchar',
      maxLength: 20,
      pattern: '^[a-zA-Z0-9_]{3,20}$',
    },
    name: groupName,
    creator: { type: 'bigint' },
    owner: { type: 'bigint' },
    created: { type: 'timestamp' },
    private: { type: 'boolean' },
    thumbnail: { type: 'varchar', maxLength: 30 },
    background: { type: 'varchar', maxLength: 30 },
  },
  required: ['id', 'name', 'slug', 'owner', 'creator', 'created', 'private'],
} as const satisfies PostgresRecordModel;
