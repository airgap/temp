import { postBody } from './postBody';
import { attachmentDraft } from './attachmentDraft';
import { ObjectBsonSchema } from 'from-schema';
import { bsonPrimitives } from 'from-schema';
const { uid } = bsonPrimitives;
import { shortcode } from './shortcode';

export const postDraft = {
	description: 'A draft of a post containing text, images, or videos',
	bsonType: 'object',
	properties: {
		id: uid,
		authorId: uid,
		body: postBody,
		replyTo: uid,
		echoing: uid,
		attachments: {
			bsonType: 'array',
			items: attachmentDraft,
		},
		shortcode,
	},
	required: ['id', 'uploadURL', 'authorId'],
} as const satisfies ObjectBsonSchema;
