import type { PostgresRecordModel } from 'from-schema';

export const imageUploadPack = {
	description:
		'Either the information you need to upload an image or video attachment, or any errors encountered',
	properties: {
		id: { type: 'text', primaryKey: true },
		uploadURL: { type: 'text' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
	},
	required: ['id', 'uploadURL', 'created'],
} as const satisfies PostgresRecordModel;
