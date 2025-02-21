import type { Game } from '@lyku/json-models';
import { defaultDate } from '../defaultDate';
export const eminence = {
	id: 5,
	title: 'Eminence',
	status: 'wip',
	nsfw: false,
	// homepage: '/play/corners',
	// thumbnail: '/btv.png',
	created: defaultDate,
} as const satisfies Game;
