import { idBond } from './idBond';
import type { PostgresRecordModel } from 'from-schema';

export const groupMembership = {
	properties: {
		id: { ...idBond, primaryKey: true },
		group: { type: 'bigint' },
		user: { type: 'bigint' },
		created: { type: 'timestamptz' },
		updated: { type: 'timestamptz' },
	},
	required: ['group', 'user', 'id', 'created', 'updated'],
} as const satisfies PostgresRecordModel;
