import type { PostgresRecordModel } from 'from-schema';

export const hashtag = {
	properties: {
		id: { type: 'bigint', primaryKey: true },
		lowerText: { type: 'text' },
	},
	required: ['id', 'lowerText'],
} as const satisfies PostgresRecordModel;
