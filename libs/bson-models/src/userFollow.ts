import { idBond } from './idBond';
import { PostgresRecordModel } from 'from-schema';

export const userFollow = {
  properties: {
    follower: { type: 'bigint' },
    followee: { type: 'bigint' },
    id: idBond,
    created: { type: 'timestamp' },
  },
  required: ['created', 'follower', 'followee', 'id'],
} as const satisfies PostgresRecordModel;
