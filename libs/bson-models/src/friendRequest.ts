import type { PostgresRecordModel } from 'from-schema';
import { idBond } from './idBond';

export const friendRequest = {
	properties: {
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		from: { type: 'bigint' },
		id: { ...idBond, primaryKey: true },
		to: { type: 'bigint' },
		updated: { type: 'timestamptz' },
	},
	required: ['created', 'from', 'id', 'to'],
} as const satisfies PostgresRecordModel;
