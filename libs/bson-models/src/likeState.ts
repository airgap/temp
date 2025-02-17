import type { PostgresRecordModel } from 'from-schema';

export const likeState = {
	properties: {
		id: { type: 'bigint', primaryKey: true },
		liked: { type: 'boolean' },
	},
	required: ['id', 'liked'],
} as const satisfies PostgresRecordModel;
