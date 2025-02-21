import type { Achievement } from '@lyku/json-models';

export const reachLevel30 = {
	points: 0,
	id: 103n,
	name: 'Reach level 30',
	icon: '/levels/30.png',
	created: new Date('2024-01-01'),
} as const satisfies Achievement;
