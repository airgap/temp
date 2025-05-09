import { PostgresRecordModel } from 'from-schema';

export const reaction = {
	properties: {
		userId: { type: 'bigint' },
		postId: { type: 'bigint' },
		created: { type: 'date' },
		updated: { type: 'date' },
		type: { type: 'text' },
	},
	required: ['userId', 'postId', 'created', 'type'],
} as const satisfies PostgresRecordModel;
