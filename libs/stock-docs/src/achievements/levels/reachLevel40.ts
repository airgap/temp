import type { Achievement } from '@lyku/json-models';

export const reachLevel40 = {
	points: 0,
	id: 104n,
	name: 'Reach level 40',
	icon: '/levels/40.png',
} as const satisfies Achievement;
