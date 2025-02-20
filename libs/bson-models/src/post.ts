import { postBody } from './postBody';
import { postTitle } from './postTitle';
import type {
	ArrayJsonSchema,
	BigIntColumnModel,
	BigSerialColumnModel,
	EnumColumnModel,
	PostgresRecordModel,
} from 'from-schema';
import { shortcode } from './shortcode';
import { user } from './user';
import { group } from './group';
export const bodyType = {
	type: 'enum',
	enum: ['plaintext', 'markdown'],
} as const satisfies EnumColumnModel;
export const postId = {
	type: 'bigint',
} as const satisfies BigIntColumnModel;
export const post = {
	description: 'A post containing text, images, or videos',
	properties: {
		id: { type: 'bigserial', primaryKey: true },
		body: postBody,
		bodyType,
		echoes: { type: 'bigint' },
		group: { type: 'bigint' },
		hashtags: { type: 'array', items: { type: 'bigint' } },
		author: { type: 'bigint' },
		likes: { type: 'bigint' },
		loves: { type: 'bigint' },
		published: { type: 'timestamptz' },
		replies: { type: 'bigint' },
		title: postTitle,
		thread: {
			type: 'array',
			items: { type: 'bigint' },
		},
		shortcode,
		replyTo: { type: 'bigint' },
		echoing: { type: 'bigint' },
		attachments: { type: 'array', items: { type: 'bigint' }, maxItems: 256 },
	},
	required: ['id', 'author', 'published', 'likes', 'echoes', 'replies'],
} as const satisfies PostgresRecordModel;
