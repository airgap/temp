import type { PostgresRecordModel } from 'from-schema';

export const membershipList = {
	properties: {
		user: { type: 'bigint', primaryKey: true },
		groups: { type: 'array', items: { type: 'bigint' } },
		count: { type: 'integer' },
		updated: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
	},
	required: ['user', 'groups', 'count'],
} as const satisfies PostgresRecordModel;
