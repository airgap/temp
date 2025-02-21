import type { PostgresRecordModel } from 'from-schema';

export const friendList = {
	properties: {
		user: { type: 'bigint', primaryKey: true },
		friends: { type: 'array', items: { type: 'bigint' } },
		count: { type: 'integer' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz' },
	},
	required: ['user', 'friends', 'count', 'created'],
} as const satisfies PostgresRecordModel;
