import type { Achievement } from '@lyku/json-models';

export const reachLevel10 = {
	points: 0,
	id: 101n,
	name: 'Reach level 10',
	icon: '/levels/10.png',
} as const satisfies Achievement;
