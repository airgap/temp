import type { Game } from '@lyku/json-models';
export const ticTacFlow = {
	id: 1,
	title: 'Tic Tac Flow',
	homepage: '/play/flow',
	status: 'ea',
	nsfw: false,
	thumbnail: '/TicTacFlowTHumb.png',
	created: new Date('2024-01-20T05:36:36.888Z'),
	updated: new Date('2024-01-20T05:36:36.888Z'),
} as const satisfies Game;
