import { startTtfMatch } from './startTtfMatch';
import { Starter } from './Starter';
import { games } from '@lyku/stock-docs';
type GameId = (typeof games)[keyof typeof games]['id'];

type GameStarters = Partial<{
	[K in GameId]: Starter;
}>;

export const gameStarters: GameStarters = {
	[games.ticTacFlow.id]: startTtfMatch,
};
