import { Achievement } from '@lyku/json-models';
import { bouncingTv } from '../../internalGames';

export const bounceStreak3 = {
	points: 33,
	id: 'fa93bee6-1500-40a2-8120-6508bbf2d80c',
	name: 'Boing Boing Boing',
	description: 'Get 3 bounces without missing',
	game: bouncingTv.id,
	icon: '/btv/streak-3.png',
} as const satisfies Achievement;
