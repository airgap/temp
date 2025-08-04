import { achievement } from '@lyku/bson-models';
import { PostgresTableModel } from 'from-schema';
import { achievements as docs } from '@lyku/stock-docs';
import { updateUpdated } from '../updateUpdated';
export const achievements = {
	indexes: ['name', 'points', 'game', 'tier'],
	schema: achievement,
	docs: Object.values(docs),
	triggers: [updateUpdated],
} satisfies PostgresTableModel<typeof achievement>;
