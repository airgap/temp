import type { Achievement } from '@lyku/json-models';
import { bouncingTv } from '../../games';

export const bounceStreak50 = {
	points: 99,
	id: 52n,
	name: 'In the Bouncy Zone',
	description: 'Get 50 bounces without missing',
	game: bouncingTv.id,
	icon: '/btv/streak-50.png',
	created: new Date('2024-01-01'),
} as const satisfies Achievement;
