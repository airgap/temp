import type { TsonHandlerModel } from 'from-schema';
import { leaderboard } from '@lyku/json-models';

export const getLeaderboard = {
	request: leaderboard.properties.id,
	response: leaderboard,
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
