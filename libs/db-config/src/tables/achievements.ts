import { achievement } from 'bson-models';
import { TableModel } from 'from-schema';
import * as docs from '../internalAchievements';

export const achievements = {
	indexes: ['name', 'points'],
	schema: achievement,
	docs: Object.values(docs),
} satisfies TableModel<typeof achievement>;
