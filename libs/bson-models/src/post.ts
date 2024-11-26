import { attachment } from './attachment';
import { postBody } from './postBody';
import { postTitle } from './postTitle';
import { bsonPrimitives } from 'from-schema';
const { date, uid, whole } = bsonPrimitives;
import {
	ArrayBsonSchema,
	EnumBsonSchema,
	FromBsonSchema,
	ObjectBsonSchema,
} from 'from-schema';
import { shortcode } from './shortcode';
export const bodyType = {
	enum: ['plaintext', 'markdown'],
} as const satisfies EnumBsonSchema;
export const attachments = {
	bsonType: 'array',
	items: attachment,
} as const satisfies ArrayBsonSchema;
export const post = {
	description: 'A post containing text, images, or videos',
	bsonType: 'object',
	properties: {
		id: uid,
		body: postBody,
		bodyType,
		echoes: whole,
		groupId: uid,
		attachments,
		authorId: uid,
		likes: whole,
		loves: whole,
		published: date,
		replies: whole,
		title: postTitle,
		thread: {
			bsonType: 'array',
			items: uid,
		},
		shortcode,
		replyTo: uid,
		echoing: uid,
	},
	required: [
		'id',
		'authorId',
		'attachments',
		'published',
		'likes',
		'echoes',
		'replies',
	],
} as const satisfies ObjectBsonSchema;
export type Post = FromBsonSchema<typeof post>;
console.log('post', post);