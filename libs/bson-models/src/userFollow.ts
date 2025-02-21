import type { PostgresRecordModel } from 'from-schema';
import { idBond } from './idBond';

export const userFollow = {
	properties: {
		follower: { type: 'bigint' },
		followee: { type: 'bigint' },
		id: { ...idBond, primaryKey: true },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz' },
	},
	required: ['created', 'follower', 'followee', 'id', 'created'],
} as const satisfies PostgresRecordModel;
