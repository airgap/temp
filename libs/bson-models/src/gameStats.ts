import { PostgresRecordModel } from 'from-schema';
import { user } from './user';

export const btvGameStats = {
  properties: {
    user: { type: 'bigint' },
    totalTime: {
      type: 'double precision',
      minimum: 0,
    },
    totalEdges: {
      type: 'bigint',
      minimum: 0,
    },
    totalCorners: {
      type: 'bigint',
      minimum: 0,
    },
    currentTime: {
      type: 'double precision',
      minimum: 0,
    },
    currentEdges: {
      type: 'bigint',
      minimum: 0,
    },
    currentCorners: {
      type: 'bigint',
      minimum: 0,
    },
    highestTime: {
      type: 'double precision',
      minimum: 0,
    },
    highestEdges: {
      type: 'bigint',
      minimum: 0,
    },
    highestCorners: {
      type: 'bigint',
      minimum: 0,
    },
    sessionCount: {
      type: 'bigint',
      minimum: 0,
    },
  },
  required: [
    'totalTime',
    'totalEdges',
    'totalCorners',
    'currentTime',
    'currentEdges',
    'currentCorners',
    'highestTime',
    'highestEdges',
    'highestCorners',
    'sessionCount',
  ],
} as const satisfies PostgresRecordModel;
