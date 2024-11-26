import { ObjectBsonSchema } from 'from-schema';
import { bsonPrimitives } from 'from-schema';
const { string, uid } = bsonPrimitives;

export const imageUploadPack = {
	description:
		'Either the information you need to upload an image or video attachment, or any errors encountered',
	bsonType: 'object',
	properties: {
		id: uid,
		uploadURL: string,
	},
	required: ['id', 'uploadURL'],
} as const satisfies ObjectBsonSchema;
