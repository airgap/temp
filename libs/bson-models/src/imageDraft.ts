import { imageUploadReason } from './imageUploadReason';
import { PostgresRecordModel } from 'from-schema';

export const imageDraft = {
	description:
		'Either the information you need to upload an image or video attachment, or any errors encountered',
	properties: {
		user: { type: 'bigint' },
		channel: { type: 'bigint' },
		post: { type: 'bigint' },
		reason: imageUploadReason,
		id: { type: 'bigint' },
		uploadURL: { type: 'text' },
		created: { type: 'timestamp' },
		filename: { type: 'text', maxLength: 100 },
	},
	required: ['id', 'user', 'reason', 'uploadURL', 'created'],
} as const satisfies PostgresRecordModel;
