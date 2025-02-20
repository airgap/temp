import { achievement } from 'bson-models';
import { PostgresTableModel } from 'from-schema';
import { achievements as docs } from '@lyku/stock-docs';

export const achievements = {
	indexes: ['name', 'points', 'game', 'tier'],
	schema: achievement,
	docs: Object.values(docs),
} satisfies PostgresTableModel<typeof achievement>;
