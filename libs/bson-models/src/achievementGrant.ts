import type { PostgresRecordModel } from 'from-schema';
import { idBond } from './idBond';

export const achievementGrant = {
	properties: {
		achievement: { type: 'bigint' },
		user: { type: 'bigint' },
		granted: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		game: { type: 'integer' },
		updated: {
			type: 'timestamptz',
			generated: { always: true, as: 'CURRENT_TIMESTAMP' },
		},
	},
	required: ['id', 'achievement', 'user', 'granted'],
} as const satisfies PostgresRecordModel;
