import { bsonPrimitives } from 'from-schema';
const { string, uid } = bsonPrimitives;
import { ObjectBsonSchema } from 'from-schema';

export const videoUploadPack = {
	description: 'The information you need to upload a video attachment',
	bsonType: 'object',
	properties: {
		uid,
		uploadURL: string,
	},
	required: ['uid', 'uploadURL'],
} as const satisfies ObjectBsonSchema;
