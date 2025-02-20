import type { PostgresRecordModel } from 'from-schema';

export const hashtag = {
	properties: {
		id: { type: 'bigint', primaryKey: true },
		lowerText: { type: 'text' },
		created: { type: 'timestamptz' },
		updated: { type: 'timestamptz' },
		usages: { type: 'bigint' },
	},
	required: ['id', 'lowerText', 'created', 'updated', 'usages'],
} as const satisfies PostgresRecordModel;
