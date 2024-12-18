import { Achievement } from '@lyku/json-models';

export const reachLevel60 = {
	points: 0,
	id: 106n,
	name: 'Reach level 60',
	icon: '/levels/60.png',
} as const satisfies Achievement;
