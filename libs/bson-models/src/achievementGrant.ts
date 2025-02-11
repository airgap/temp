import type { PostgresRecordModel } from 'from-schema';

export const achievementGrant = {
	properties: {
		id: { type: 'text' },
		achievement: { type: 'bigint' },
		user: { type: 'bigint' },
		granted: { type: 'timestamp' },
		game: { type: 'int' },
	},
	required: ['id', 'achievement', 'user', 'granted'],
} as const satisfies PostgresRecordModel;
