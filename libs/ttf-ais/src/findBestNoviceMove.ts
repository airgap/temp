import type {
	BoardWithCountdown,
	MaybeMove,
	Move,
	Player,
} from '@lyku/helpers';

type Combo = [Move, Move, Move];
export function findBestNoviceMove(
	board: BoardWithCountdown,
	who: Player,
): MaybeMove {
	const winningCombos: Combo[] = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8], // rows
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8], // columns
		[0, 4, 8],
		[2, 4, 6], // diagonals
	];

	const checkCombo = (combo: Combo, player: Player): MaybeMove => {
		const indices = combo.map((index) => board[index]);
		const emptyIndex = combo.find((index) => board[index] === '-');
		return indices.filter((val) => val === player).length === 2 &&
			emptyIndex !== undefined
			? emptyIndex
			: null;
	};

	for (const player of who === 'X' ? ['X', 'O'] : ['O', 'X']) {
		for (const combo of winningCombos) {
			const move = checkCombo(combo, player as Player);
			if (move !== null) {
				return move;
			}
		}
	}

	// Strategic moves
	if (board[4] === '-') return 4; // Center
	const corners = [0, 2, 6, 8];
	const sides = [1, 3, 5, 7];
	for (const i of [...corners, ...sides]) {
		if (board[i] === '-') return i as Move;
	}
	throw 'No moves available';
}
