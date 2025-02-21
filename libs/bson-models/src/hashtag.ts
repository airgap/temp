import type { PostgresRecordModel } from 'from-schema';

export const hashtag = {
	properties: {
		id: { type: 'bigint', primaryKey: true },
		lowerText: { type: 'text' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz' },
		usages: { type: 'bigint' },
	},
	required: ['id', 'lowerText', 'created', 'usages'],
} as const satisfies PostgresRecordModel;
