import { Achievement } from '@lyku/json-models';

export const reachLevel20 = {
	points: 0,
	id: 102n,
	name: 'Reach level 20',
	icon: '/levels/20.png',
} as const satisfies Achievement;
