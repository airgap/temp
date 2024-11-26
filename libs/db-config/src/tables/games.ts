import { TableModel } from 'from-schema';
import { game } from 'bson-models';
import * as gameDocs from '../internalGames';

export const games = {
	indexes: ['developer', 'publisher', 'title'],
	schema: game,
	docs: Object.values(gameDocs),
} as const satisfies TableModel<typeof game>;
