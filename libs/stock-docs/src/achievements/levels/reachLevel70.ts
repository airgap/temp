import type { Achievement } from '@lyku/json-models';

export const reachLevel70 = {
	points: 0,
	id: 107n,
	name: 'Reach level 70',
	icon: '/levels/70.png',
} as const satisfies Achievement;
