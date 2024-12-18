import { Achievement } from '@lyku/json-models';
import { bouncingTv } from '../../games';

export const edge1 = {
	points: 10,
	id: 55n,
	name: 'Walled In',
	description: 'Get an edge shot playing Bouncing TV',
	icon: '/levels/1.png',
	game: bouncingTv.id,
} as const satisfies Achievement;
