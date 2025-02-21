import type { Game } from '@lyku/json-models';
import { defaultDate } from '../defaultDate';
export const bouncingTv = {
	id: 2,
	title: 'Bouncing TV',
	status: 'wip',
	nsfw: false,
	// homepage: '/play/corners',
	thumbnail: '/btv.png',
	created: defaultDate,
} as const satisfies Game;
