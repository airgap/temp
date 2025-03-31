import type { PostgresRecordModel } from 'from-schema';

export const like = {
	properties: {
		userId: { type: 'bigint' },
		postId: { type: 'bigint' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
	},
	required: ['userId', 'postId', 'created'],
} as const satisfies PostgresRecordModel;
