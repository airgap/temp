import type { Achievement } from '@lyku/json-models';

export const reachLevel10 = {
	points: 0,
	id: 101n,
	name: 'Reach level 10',
	icon: '/levels/10.png',
	created: new Date('2024-01-01'),
} as const satisfies Achievement;
