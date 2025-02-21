import { InsertableGameSession } from '@lyku/json-models';

export const newGameSession = (): InsertableGameSession => ({
	time: 0n,
	edges: 0n,
	corners: 0n,
});
