import type { Group } from '@lyku/json-models';
import { system } from '../users';
import { defaultDate } from '../defaultDate';

export const beta = {
	id: 1n,
	slug: 'Beta',
	lowerSlug: 'beta',
	name: 'Beta',
	private: false,
	creator: system.id,
	owner: system.id,
	created: defaultDate,
	members: 0n,
} as const satisfies Group;
