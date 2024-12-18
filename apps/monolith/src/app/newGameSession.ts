import { FromSchema } from 'from-schema';
import { gameSession } from 'models';

export const newGameSession = (): FromSchema<typeof gameSession> => ({
	time: 0,
	edges: 0,
	corners: 0,
});
