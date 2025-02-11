import type { Achievement } from '@lyku/json-models';
import { bouncingTv } from '../../games';

export const bounceStreak3 = {
	points: 33,
	id: 50n,
	name: 'Boing Boing Boing',
	description: 'Get 3 bounces without missing',
	game: bouncingTv.id,
	icon: '/btv/streak-3.png',
} as const satisfies Achievement;
