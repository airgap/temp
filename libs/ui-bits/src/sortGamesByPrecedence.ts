// Sort games by how playable they are
import { GameStatus } from '@lyku/json-models';
import { Game } from '@lyku/json-models';

const statusPrecedence = {
	ga: 1,
	ea: 2,
	maintenance: 3,
	wip: 4,
	planned: 5,
} satisfies Record<GameStatus, number>;
export const sortGamesByPrecedence = (games: Game[]) =>
	games.sort(
		(g1: Game, g2: Game) =>
			statusPrecedence[g1.status] - statusPrecedence[g2.status],
	);
