export type Player = 'X' | 'O';
export type Empty = '-';
export type Countdown = '1' | '2' | '3';
export type Square = Player | Empty;
export type Board =
	`${Square}${Square}${Square}${Square}${Square}${Square}${Square}${Square}${Square}`;
export type BoardWithCountdown = `${Board}${Countdown}`;
export type Move = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type MaybeMove = Move | null;

export type MoveMap = Record<BoardWithCountdown, MaybeMove>;
export type BisexualMoveMap = { X: MoveMap; O: MoveMap };
