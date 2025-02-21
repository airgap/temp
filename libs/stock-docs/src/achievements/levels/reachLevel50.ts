import type { Achievement } from '@lyku/json-models';

export const reachLevel50 = {
	points: 0,
	id: 105n,
	name: 'Reach level 50',
	icon: '/levels/50.png',
	created: new Date('2024-01-01'),
} as const satisfies Achievement;
