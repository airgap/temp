import type { Game } from '@lyku/json-models';
export const bouncingTv = {
	id: 2,
	title: 'Bouncing TV',
	status: 'wip',
	nsfw: false,
	// homepage: '/play/corners',
	thumbnail: '/btv.png',
	created: new Date('2024-01-20T05:36:36.888Z'),
	updated: new Date('2024-01-20T05:36:36.888Z'),
} as const satisfies Game;
