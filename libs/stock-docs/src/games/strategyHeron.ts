import type { Game } from '@lyku/json-models';
import { defaultDate } from '../defaultDate';
export const strategyHeron = {
	id: 3,
	title: 'Strategy Heron',
	// homepage: '/play/heron',
	status: 'planned',
	nsfw: false,
	thumbnail: '/heron.png',
	created: defaultDate,
	developer: 0,
} as const satisfies Game;
