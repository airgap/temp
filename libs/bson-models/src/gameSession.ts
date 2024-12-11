import { PostgresRecordModel } from 'from-schema';

export const gameSession = {
  properties: {
    time: {
      type: 'bigint',
      minimum: 0,
    },
    edges: {
      type: 'bigint',
      minimum: 0,
    },
    corners: {
      type: 'bigint',
      minimum: 0,
    },
  },
  required: ['time', 'edges', 'corners'],
} as const satisfies PostgresRecordModel;
