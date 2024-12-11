import { PostgresRecordModel } from 'from-schema';

export const score = {
  properties: {
    posted: { type: 'timestamp' },
    user: { type: 'bigint' },
    channel: { type: 'bigint' },
    reports: { type: 'int' },
    columns: {
      type: 'array',
      items: { type: 'numeric' },
    },
    leaderboard: { type: 'bigint' },
    game: { type: 'bigint' },
  },
  required: [
    'posted',
    'user',
    'channel',
    'reports',
    'columns',
    'leaderboard',
    'game',
  ],
} as const satisfies PostgresRecordModel;
