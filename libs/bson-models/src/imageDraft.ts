import type { PostgresRecordModel } from 'from-schema';
import { imageUploadReason } from './imageUploadReason';

export const imageDraft = {
	description:
		'Either the information you need to upload an image or video attachment, or any errors encountered',
	properties: {
		author: { type: 'bigint' },
		channel: { type: 'bigint' },
		post: { type: 'bigint' },
		reason: imageUploadReason,
		id: { type: 'bigint', primaryKey: true },
		uploadURL: { type: 'text' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		filename: { type: 'text', maxLength: 300 },
	},
	required: ['id', 'author', 'reason', 'uploadURL', 'created', 'filename'],
} as const satisfies PostgresRecordModel;
