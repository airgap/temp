import { PostgresTableModel } from 'from-schema';
import { ttfMatch } from 'bson-models';

export const ttfMatches = {
	indexes: ['X', 'O', 'board', 'created', 'lastTurn', 'winner'],
	schema: ttfMatch,
} as const satisfies PostgresTableModel<typeof ttfMatch>;
