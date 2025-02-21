import type { Achievement } from '@lyku/json-models';
import { bouncingTv } from '../../games';

export const bounceStreak100 = {
	points: 123,
	id: 53n,
	name: 'A Century of Bounce',
	description: 'Get 100 bounces without missing',
	game: bouncingTv.id,
	icon: '/btv/streak-100.png',
	created: new Date('2024-01-01'),
} as const satisfies Achievement;
