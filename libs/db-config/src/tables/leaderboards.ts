import { TableModel } from 'from-schema';
import { leaderboard } from 'bson-models';

export const leaderboards = {
	indexes: ['game'],
	schema: leaderboard,
} as const satisfies TableModel<typeof leaderboard>;
