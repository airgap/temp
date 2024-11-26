import { Achievement } from '@lyku/json-models';
import { bouncingTv } from '../../internalGames';

export const bounceStreak10 = {
	points: 66,
	id: 'c7ad320e-4caf-47b6-9e3e-8ae074412532',
	name: 'Off the Walls',
	description: 'Get 10 bounces without missing',
	game: bouncingTv.id,
	icon: '/btv/streak-10.png',
} as const satisfies Achievement;
