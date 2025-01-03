import { Player } from './Player';
import { TtfMatch } from 'models';

export const placePieceInMatch = (
	iAm: Player,
	square: number,
	match: TtfMatch
) => {
	match.board = `${match.board.substring(
		0,
		square
	)}${iAm}${match.board.substring(square + 1)}`;
	match.turn++;
	match.whoseTurn = iAm === 'X' ? match.O : match.X;
	return match;
};
