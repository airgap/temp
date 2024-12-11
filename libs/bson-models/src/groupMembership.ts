import { group } from './group';
import { user } from './user';
import { idBond } from './idBond';
import { PostgresRecordModel } from 'from-schema';

export const groupMembership = {
  properties: {
    id: idBond,
    group: group.properties.id,
    user: user.properties.id,
    created: { type: 'timestamp' },
  },
  required: ['group', 'user', 'id', 'created'],
} as const satisfies PostgresRecordModel;
