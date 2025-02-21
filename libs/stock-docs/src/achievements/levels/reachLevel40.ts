import type { Achievement } from '@lyku/json-models';

export const reachLevel40 = {
	points: 0,
	id: 104n,
	name: 'Reach level 40',
	icon: '/levels/40.png',
	created: new Date('2024-01-01'),
} as const satisfies Achievement;
