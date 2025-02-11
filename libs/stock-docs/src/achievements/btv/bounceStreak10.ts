import type { Achievement } from '@lyku/json-models';
import { bouncingTv } from '../../games';

export const bounceStreak10 = {
	points: 66,
	id: 51n,
	name: 'Off the Walls',
	description: 'Get 10 bounces without missing',
	game: bouncingTv.id,
	icon: '/btv/streak-10.png',
} as const satisfies Achievement;
