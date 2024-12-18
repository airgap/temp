import { PostgresTableModel } from 'from-schema';
import { game } from 'bson-models';
import { games as docs } from '@lyku/stock-docs';

export const games = {
	indexes: ['developer', 'publisher', 'title'],
	schema: game,
	docs: Object.values(docs),
} as const satisfies PostgresTableModel<typeof game>;
