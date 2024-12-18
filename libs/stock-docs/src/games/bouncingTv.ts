import { Game } from '@lyku/json-models';
export const bouncingTv = {
	id: 2,
	title: 'Bouncing TV',
	status: 'wip',
	nsfw: false,
	// homepage: '/play/corners',
	thumbnail: '/btv.png',
} as const satisfies Game;
