import { ObjectBsonSchema } from 'from-schema';
import { videoUploadPack } from './videoUploadPack';
import { bsonPrimitives } from 'from-schema';
const { uid } = bsonPrimitives;

export const videoDraft = {
	description:
		'Either the information you need to upload an image or video attachment, or any errors encountered',
	bsonType: 'object',
	properties: {
		supertype: 'video',
		userId: uid,
		id: uid,
		channelId: uid,
		postId: uid,
		...videoUploadPack.properties,
	},
	required: ['supertype', 'id', 'userId', ...videoUploadPack.required],
} as const satisfies ObjectBsonSchema;
