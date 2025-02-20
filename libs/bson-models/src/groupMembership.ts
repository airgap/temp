import { group } from './group';
import { user } from './user';
import { idBond } from './idBond';
import type { PostgresRecordModel } from 'from-schema';

export const groupMembership = {
	properties: {
		id: { ...idBond, primaryKey: true },
		group: { type: 'bigint' },
		user: { type: 'bigint' },
		created: { type: 'timestamptz' },
	},
	required: ['group', 'user', 'id', 'created'],
} as const satisfies PostgresRecordModel;
