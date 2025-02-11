import type { PostgresRecordModel } from 'from-schema';
import { idBond } from './idBond';

export const friendRequest = {
	properties: {
		created: { type: 'timestamp' },
		from: { type: 'bigint' },
		id: idBond,
		to: { type: 'bigint' },
	},
	required: ['created', 'from', 'id', 'to'],
} as const satisfies PostgresRecordModel;
