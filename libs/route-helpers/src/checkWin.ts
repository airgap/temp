import { TtfBoard } from '@lyku/json-models';

const winCombos = [
	[0, 1, 2], // Top row
	[3, 4, 5], // Middle row
	[6, 7, 8], // Bottom row
	[0, 3, 6], // Left column
	[1, 4, 7], // Middle column
	[2, 5, 8], // Right column
	[0, 4, 8], // Diagonal from top-left
	[2, 4, 6], // Diagonal from top-right
] as const;

export const checkWin = (board: TtfBoard, player: 'X' | 'O') =>
	winCombos.some((combo) => combo.every((index) => board[index] === player));
