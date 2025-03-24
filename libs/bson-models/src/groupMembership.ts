import { idBond } from './idBond';
import type { PostgresRecordModel } from 'from-schema';

export const groupMembership = {
	properties: {
		id: { ...idBond, primaryKey: true },
		group: { type: 'bigint' },
		user: { type: 'bigint' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
	},
	required: ['group', 'user', 'id', 'created', 'updated'],
} as const satisfies PostgresRecordModel;
