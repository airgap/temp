import type { Achievement } from '@lyku/json-models';

export const reachLevel60 = {
	points: 0,
	id: 106n,
	name: 'Reach level 60',
	icon: '/levels/60.png',
	created: new Date('2024-01-01'),
} as const satisfies Achievement;
