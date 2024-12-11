import { PostgresRecordModel } from 'from-schema';

export const achievementGrant = {
  properties: {
    id: { type: 'text' },
    achievement: { type: 'bigint' },
    user: { type: 'bigint' },
    granted: { type: 'timestamp' },
    game: { type: 'bigint' },
  },
  required: ['id', 'achievement', 'user', 'granted', 'game'],
} as const satisfies PostgresRecordModel;
