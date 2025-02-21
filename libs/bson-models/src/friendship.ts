import type { PostgresRecordModel } from 'from-schema';
import { idBond } from './idBond';

export const friendship = {
	properties: {
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		id: { ...idBond, primaryKey: true },
		users: {
			type: 'array',
			minItems: 2,
			maxItems: 2,
			items: { type: 'bigint' },
		},
		deleted: { type: 'timestamptz' },
	},
	required: ['created', 'id', 'users'],
} as const satisfies PostgresRecordModel;
