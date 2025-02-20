import type { PostgresRecordModel } from 'from-schema';

export const friendList = {
	properties: {
		user: { type: 'bigint', primaryKey: true },
		friends: { type: 'array', items: { type: 'bigint' } },
		count: { type: 'integer' },
		created: { type: 'timestamptz' },
		updated: { type: 'timestamptz' },
	},
	required: ['user', 'friends', 'count', 'created', 'updated'],
} as const satisfies PostgresRecordModel;
