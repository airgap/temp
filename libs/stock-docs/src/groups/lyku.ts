import type { Group } from '@lyku/json-models';
import { system } from '../users';
import { defaultDate } from '../defaultDate';

export const lyku = {
	id: 0n,
	slug: 'Lyku',
	lowerSlug: 'lyku',
	name: 'Lyku',
	private: false,
	creator: system.id,
	owner: system.id,
	created: defaultDate,
	members: 0n,
} as const satisfies Group;
