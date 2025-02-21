import type { PostgresRecordModel } from 'from-schema';

export const likeState = {
	properties: {
		id: { type: 'bigint', primaryKey: true },
		liked: { type: 'boolean' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
	},
	required: ['id', 'liked', 'created'],
} as const satisfies PostgresRecordModel;
