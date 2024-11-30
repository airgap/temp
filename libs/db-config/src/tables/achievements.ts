import { achievement } from 'bson-models';
import { TableModel } from 'from-schema';
import { achievements as docs } from '@lyku/stock-docs';

export const achievements = {
	indexes: ['name', 'points'],
	schema: achievement,
	docs: Object.values(docs),
} satisfies TableModel<typeof achievement>;
