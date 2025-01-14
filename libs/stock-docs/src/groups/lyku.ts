import { Group } from '@lyku/json-models';
import { system } from '../users';

export const lyku = {
	id: 0n,
	slug: 'Lyku',
	lowerSlug: 'lyku',
	name: 'Lyku',
	private: false,
	creator: system.id,
	owner: system.id,
	created: new Date('2024-01-20T05:36:36.888Z'),
} as const satisfies Group;
