import type { TtfMatch } from '@lyku/json-models';
import type { Player } from './Player';

export const placePieceInMatch = (
	iAm: Player,
	square: number,
	match: TtfMatch
): TtfMatch => {
	match.board = `${match.board.substring(
		0,
		square
	)}${iAm}${match.board.substring(square + 1)}`;
	match.turn++;
	match.whoseTurn = iAm === 'X' ? match.O : match.X;
	return match;
};
