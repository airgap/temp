import { PostgresRecordModel } from 'from-schema';

export const hashtag = {
	properties: {
		id: { type: 'bigint' },
		lowerText: { type: 'text' },
	},
	required: ['id', 'lowerText'],
} as const satisfies PostgresRecordModel;
