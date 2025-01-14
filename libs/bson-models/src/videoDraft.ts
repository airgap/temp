import { PostgresRecordModel } from 'from-schema';

export const videoDraft = {
	description:
		'Either the information you need to upload an image or video attachment, or any errors encountered',
	properties: {
		user: { type: 'bigint' },
		channel: { type: 'bigint' },
		post: { type: 'bigint' },
		id: { type: 'text' },
		uid: { type: 'text', maxLength: 32 },
		uploadURL: { type: 'text' },
		created: { type: 'timestamp' },
		filename: { type: 'text', maxLength: 100 },
	},
	required: ['id', 'user', 'post', 'uid', 'uploadURL', 'created'],
} as const satisfies PostgresRecordModel;
