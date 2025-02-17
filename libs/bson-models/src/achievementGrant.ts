import type { PostgresRecordModel } from 'from-schema';
import { idBond } from './idBond';

export const achievementGrant = {
	properties: {
		id: { ...idBond, primaryKey: true },
		achievement: { type: 'bigint' },
		user: { type: 'bigint' },
		granted: { type: 'timestamp' },
		game: { type: 'int' },
	},
	required: ['id', 'achievement', 'user', 'granted'],
} as const satisfies PostgresRecordModel;
