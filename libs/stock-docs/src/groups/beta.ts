import { Group } from '@lyku/json-models';
import { system } from '../users';

export const beta = {
	id: 'beta',
	name: 'Beta',
	private: false,
	creator: system.id,
	owner: system.id,
	created: new Date('2024-01-20T05:36:36.888Z'),
} as const satisfies Group;
