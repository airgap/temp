import { achievement } from 'bson-models';
import { PostgresTableModel } from 'from-schema';
import { achievements as docs } from '@lyku/stock-docs';
import updatedTrigger from './updated.sql';
export const achievements = {
	indexes: ['name', 'points', 'game', 'tier'],
	schema: achievement,
	docs: Object.values(docs),
	triggers: [
		{
			before: 'update',
			sql: updatedTrigger,
		},
	],
} satisfies PostgresTableModel<typeof achievement>;
