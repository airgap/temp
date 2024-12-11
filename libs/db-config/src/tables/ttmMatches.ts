import { PostgresTableModel } from 'from-schema';
import { ttmMatch } from 'bson-models';

export const ttmMatches = {
  indexes: ['X', 'O', 'board', 'created', 'lastTurn', 'winner'],
  schema: ttmMatch,
} as const satisfies PostgresTableModel<typeof ttmMatch>;
