import type { PostgresRecordModel } from 'from-schema';

export const fileDraft = {
	description:
		'Either the information you need to upload an image or video attachment, or any errors encountered',
	properties: {
		creator: { type: 'bigint' },
		post: { type: 'bigint' },
		id: { type: 'bigint' },
		uploadURL: { type: 'text' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		filename: { type: 'text', maxLength: 100 },
		type: { type: 'text', maxLength: 100 },
		host: { type: 'text', maxLength: 100 },
	},
	required: [
		'id',
		'creator',
		'post',
		'uid',
		'uploadURL',
		'created',
		'type',
		'host',
	],
} as const satisfies PostgresRecordModel;
