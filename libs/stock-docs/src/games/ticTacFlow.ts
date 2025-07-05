import type { Game } from '@lyku/json-models';
import { defaultDate } from '../defaultDate';
export const ticTacFlow = {
	id: 1,
	title: 'Tic Tac Flow',
	homepage: '/play/flow',
	status: 'wip',
	nsfw: false,
	thumbnail: '/TicTacFlowTHumb.png',
	created: defaultDate,
	developer: 0,
} as const satisfies Game;
