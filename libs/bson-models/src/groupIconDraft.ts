import type { PostgresRecordModel } from 'from-schema';

export const groupIconDraft = {
	description:
		'Either the information you need to upload an image or video attachment, or any errors encountered',
	properties: {
		creator: { type: 'bigint' },
		id: { type: 'bigint', generated: { as: 'IDENTITY' } },
		uploadURL: { type: 'text' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		filename: { type: 'text', maxLength: 100 },
		type: { type: 'text', maxLength: 100 },
		size: { type: 'double precision' },
		width: { type: 'integer' },
		height: { type: 'integer' },
		hostId: { type: 'text', maxLength: 100 },
		group: { type: 'bigint' },
	},
	required: ['id', 'hostId', 'creator', 'uploadURL', 'created', 'group'],
} as const satisfies PostgresRecordModel;
