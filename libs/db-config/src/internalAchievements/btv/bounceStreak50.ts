import { Achievement } from '@lyku/json-models';
import { bouncingTv } from '../../internalGames';

export const bounceStreak50 = {
	points: 99,
	id: 'ede0221a-c3f4-4d57-a917-504c854851cb',
	name: 'In the Bouncy Zone',
	description: 'Get 50 bounces without missing',
	game: bouncingTv.id,
	icon: '/btv/streak-50.png',
} as const satisfies Achievement;
