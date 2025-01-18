import { BoardWithCountdown, MaybeMove, Move, Player, Square } from '../Player';

export function findBestHardMove(
	board: BoardWithCountdown,
	who: Player
): MaybeMove {
	// Parse the board and turn count
	const parsedBoard = board
		.slice(0, -1)
		.split('')
		.map((c) => c as Square);
	const turnsUntilDrop = parseInt(board.slice(-1));

	// Minimax function
	function minimax(
		board: Square[],
		turnsUntilDrop: number,
		depth: number,
		isMaximizing: boolean
	): number {
		const winner = checkWinner(board, turnsUntilDrop);
		if (winner !== null) {
			return winner === who ? 10 : winner === '-' ? 0 : -10;
		}

		// Check for immediate win
		const immediateWinMove = getImmediateWinMove(board, who);
		if (immediateWinMove !== null) {
			return isMaximizing ? 10 : -10;
		}

		// Helper function to find an immediate winning move
		function getImmediateWinMove(board: Square[], player: Player): MaybeMove {
			for (let i: Move = 0; i < 9; i++) {
				if (board[i] === '-') {
					board[i] = player;
					if (checkWinner(board, turnsUntilDrop) === player) {
						board[i] = '-';
						return i as Move;
					}
					board[i] = '-';
				}
			}
			return null;
		}

		if (isMaximizing) {
			let bestScore = -Infinity;
			for (let i: Move = 0; i < 9; i++) {
				if (board[i] === '-') {
					board[i] = who;
					const score = minimax(board, turnsUntilDrop - 1, depth + 1, false);
					board[i] = '-';
					bestScore = Math.max(score, bestScore);
				}
			}
			return bestScore;
		} else {
			let bestScore = Infinity;
			for (let i = 0; i < board.length; i++) {
				if (board[i] === '-') {
					board[i] = who === 'X' ? 'O' : 'X';
					const score = minimax(board, turnsUntilDrop - 1, depth + 1, true);
					board[i] = '-';
					bestScore = Math.min(score, bestScore);
				}
			}
			return bestScore;
		}
	}
	function checkWinner(board: Square[], turnsUntilDrop: number): Square | null {
		// Convert the linear board array into a 3x3 matrix for easier manipulation
		const matrix: Square[][] = [];
		for (let i = 0; i < 3; i++) {
			matrix.push(board.slice(i * 3, i * 3 + 3));
		}

		// Check for winner in rows, columns, and diagonals
		for (let i = 0; i < 3; i++) {
			if (
				matrix[i][0] === matrix[i][1] &&
				matrix[i][1] === matrix[i][2] &&
				matrix[i][0] !== '-'
			) {
				return matrix[i][0];
			}
			if (
				matrix[0][i] === matrix[1][i] &&
				matrix[1][i] === matrix[2][i] &&
				matrix[0][i] !== '-'
			) {
				return matrix[0][i];
			}
		}
		if (
			matrix[0][0] === matrix[1][1] &&
			matrix[1][1] === matrix[2][2] &&
			matrix[0][0] !== '-'
		) {
			return matrix[0][0];
		}
		if (
			matrix[0][2] === matrix[1][1] &&
			matrix[1][1] === matrix[2][0] &&
			matrix[0][2] !== '-'
		) {
			return matrix[0][2];
		}

		// Check if the board is full or will become full after the next drop
		if (
			!board.includes('-') ||
			(turnsUntilDrop === 1 && !matrix[2].includes('-'))
		) {
			return '-';
		}

		// No winner and the board is not full
		return null;
	}

	// Finding the best move
	let bestScore = -Infinity;
	let bestMove: MaybeMove = null;
	for (let i = 0; i < parsedBoard.length; i++) {
		if (parsedBoard[i] === '-') {
			parsedBoard[i] = who;
			const score = minimax(parsedBoard, turnsUntilDrop - 1, 0, false);
			parsedBoard[i] = '-';
			if (score > bestScore) {
				bestScore = score;
				bestMove = i as Move;
			}
		}
	}

	return bestMove;
}
