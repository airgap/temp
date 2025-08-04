import { PostgresTableModel } from 'from-schema';
import { game } from '@lyku/bson-models';
import { games as docs } from '@lyku/stock-docs';
import { updateUpdated } from '../updateUpdated';
export const games = {
	indexes: ['developer', 'publisher', 'title', 'created', 'updated'],
	schema: game,
	docs: Object.values(docs),
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof game>;
