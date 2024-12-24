import { postBody } from './postBody';
import { PostgresRecordModel } from 'from-schema';

export const postDraft = {
	description: 'A draft of a post containing text, images, or videos',
	properties: {
		id: { type: 'bigserial' },
		author: { type: 'bigint' },
		body: postBody,
		replyTo: { type: 'bigint' },
		echoing: { type: 'bigint' },
		attachments: { type: 'array', items: { type: 'bigint' } },
	},
	required: ['id', 'author', 'uploadURL', 'authorId'],
} as const satisfies PostgresRecordModel;
