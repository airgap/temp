import type { Game } from '@lyku/json-models';
export const strategyHeron = {
	id: 3,
	title: 'Strategy Heron',
	// homepage: '/play/heron',
	status: 'planned',
	nsfw: false,
	thumbnail: '/heron.png',
	created: new Date('2024-01-20T05:36:36.888Z'),
	updated: new Date('2024-01-20T05:36:36.888Z'),
} as const satisfies Game;
