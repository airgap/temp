import { GameSession } from '@lyku/json-models';

export const newGameSession = (): GameSession => ({
	time: 0n,
	edges: 0n,
	corners: 0n,
});
