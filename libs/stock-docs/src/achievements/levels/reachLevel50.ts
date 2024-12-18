import { Achievement } from '@lyku/json-models';

export const reachLevel50 = {
	points: 0,
	id: 105n,
	name: 'Reach level 50',
	icon: '/levels/50.png',
} as const satisfies Achievement;
