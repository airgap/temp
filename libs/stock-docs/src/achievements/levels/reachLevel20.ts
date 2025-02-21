import type { Achievement } from '@lyku/json-models';

export const reachLevel20 = {
	points: 0,
	id: 102n,
	name: 'Reach level 20',
	icon: '/levels/20.png',
	created: new Date('2024-01-01'),
} as const satisfies Achievement;
