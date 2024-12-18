import { TtfBoard } from 'models';

export const isValidTicTacToeMove = (
	board: TtfBoard,
	who: 'X' | 'O',
	where: number,
) => {
	if (board[where - 1] !== '-') return false;
	const xs = board.match(/X/g)?.length ?? 0;
	const os = board.match(/O/g)?.length ?? 0;
	if (who === 'X' && xs > os) return false;
	if (who === 'O' && os >= xs) return false;
	return true;
};
