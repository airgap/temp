import type { Game } from '@lyku/json-models';
export const ticTacFlow = {
	id: 1,
	title: 'Tic Tac Flow',
	homepage: '/play/flow',
	status: 'ea',
	nsfw: false,
	thumbnail: '/TicTacFlowTHumb.png',
} as const satisfies Game;
