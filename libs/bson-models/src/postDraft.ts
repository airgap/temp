import type { PostgresRecordModel } from 'from-schema';
import { postBody } from './postBody';

export const postDraft = {
	description: 'A draft of a post containing text, images, or videos',
	properties: {
		id: { type: 'bigserial', primaryKey: true },
		author: { type: 'bigint' },
		body: postBody,
		replyTo: { type: 'bigint' },
		echoing: { type: 'bigint' },
		attachments: { type: 'array', items: { type: 'bigint' } },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz' },
	},
	required: ['id', 'author', 'uploadURL', 'authorId', 'created'],
} as const satisfies PostgresRecordModel;
