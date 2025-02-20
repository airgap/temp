import type { PostgresRecordModel } from 'from-schema';
import { idBond } from './idBond';

export const friendRequest = {
	properties: {
		created: { type: 'timestamptz' },
		from: { type: 'bigint' },
		id: { ...idBond, primaryKey: true },
		to: { type: 'bigint' },
	},
	required: ['created', 'from', 'id', 'to'],
} as const satisfies PostgresRecordModel;
