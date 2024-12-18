import { Achievement } from '@lyku/json-models';
import { bouncingTv } from '../../games';

export const corner1 = {
	points: 20,
	id: 54n,
	name: 'Cornered',
	description: 'Get a corner shot playing Bouncing TV',
	icon: '/levels/1.png',
	game: bouncingTv.id,
} as const satisfies Achievement;
