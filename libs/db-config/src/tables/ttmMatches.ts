import { PostgresTableModel } from 'from-schema';
import { ttmMatch } from '@lyku/bson-models';
import { updateUpdated } from '../updateUpdated';
export const ttmMatches = {
	indexes: ['X', 'O', 'board', 'created', 'updated', 'winner'],
	schema: ttmMatch,
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof ttmMatch>;
