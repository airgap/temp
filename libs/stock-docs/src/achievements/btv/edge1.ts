import type { Achievement } from '@lyku/json-models';
import { bouncingTv } from '../../games';

export const edge1 = {
	points: 10,
	id: 55n,
	name: 'Walled In',
	description: 'Get an edge shot playing Bouncing TV',
	icon: '/levels/1.png',
	game: bouncingTv.id,
	created: new Date('2024-01-01'),
} as const satisfies Achievement;
