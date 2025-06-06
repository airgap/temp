import type { PostgresRecordModel } from 'from-schema';

export const videoDraft = {
	description:
		'Either the information you need to upload an image or video attachment, or any errors encountered',
	properties: {
		creator: { type: 'bigint' },
		post: { type: 'bigint' },
		id: { type: 'bigint', primaryKey: true },
		uploadURL: { type: 'text' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		filename: { type: 'text', maxLength: 100 },
	},
	required: ['id', 'creator', 'post', 'uid', 'uploadURL', 'created'],
} as const satisfies PostgresRecordModel;
