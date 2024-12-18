import { idBond } from './idBond';
import { PostgresRecordModel } from 'from-schema';

export const friendship = {
	properties: {
		created: { type: 'timestamp' },
		id: idBond,
		users: {
			type: 'array',
			minItems: 2,
			maxItems: 2,
			items: { type: 'bigint' },
		},
	},
	required: ['created', 'id', 'users'],
} as const satisfies PostgresRecordModel;
