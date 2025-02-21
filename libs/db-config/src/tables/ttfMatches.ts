import { PostgresTableModel } from 'from-schema';
import { ttfMatch } from 'bson-models';
import { updateUpdated } from '../updateUpdated';

export const ttfMatches = {
	indexes: ['X', 'O', 'board', 'created', 'updated', 'winner'],
	schema: ttfMatch,
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof ttfMatch>;
