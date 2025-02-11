import type { PostgresRecordModel } from 'from-schema';

export const friendList = {
	properties: {
		user: { type: 'bigint' },
		friends: { type: 'array', items: { type: 'bigint' } },
		count: { type: 'integer' },
	},
	required: ['user', 'friends', 'count'],
} as const satisfies PostgresRecordModel;
