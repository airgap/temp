import { imageUploadPack } from './imageUploadPack';
import { imageUploadReason } from './imageUploadReason';
import { ObjectBsonSchema } from 'from-schema';
import { user } from './user';
import { channel } from './channel';
import { post } from './post';

export const imageDraft = {
	description:
		'Either the information you need to upload an image or video attachment, or any errors encountered',
	bsonType: 'object',
	properties: {
		supertype: 'image',
		userId: user.properties.id,
		channelId: channel.properties.id,
		postId: post.properties.id,
		reason: imageUploadReason,
		...imageUploadPack.properties,
	},
	required: ['supertype', 'id', 'userId', ...imageUploadPack.required],
} as const satisfies ObjectBsonSchema;
