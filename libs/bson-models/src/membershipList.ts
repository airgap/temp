import type { PostgresRecordModel } from 'from-schema';

export const membershipList = {
	properties: {
		user: { type: 'bigint', primaryKey: true },
		groups: { type: 'array', items: { type: 'bigint' } },
		count: { type: 'integer' },
	},
	required: ['user', 'groups', 'count'],
} as const satisfies PostgresRecordModel;
