import type { PostgresRecordModel } from 'from-schema';

export const membershipList = {
	properties: {
		user: { type: 'bigint', primaryKey: true },
		groups: { type: 'array', items: { type: 'bigint' } },
		count: { type: 'integer' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
	},
	required: ['user', 'groups', 'created', 'count'],
} as const satisfies PostgresRecordModel;
