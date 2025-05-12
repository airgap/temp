import { PostgresRecordModel } from 'from-schema';

export const reaction = {
	properties: {
		userId: { type: 'bigint' },
		postId: { type: 'bigint' },
		created: { type: 'timestamptz' },
		updated: { type: 'timestamptz' },
		type: { type: 'text' },
	},
	required: ['userId', 'postId', 'created', 'type'],
} as const satisfies PostgresRecordModel;
