import { Game } from '@lyku/json-models';
import { defaultDate } from '../defaultDate';
export const strategyHarem = {
	id: 4,
	title: 'Strategy Harem',
	// homepage: '/play/harem',
	status: 'planned',
	nsfw: true,
	created: defaultDate,
	developer: 0,
} as const satisfies Game;
