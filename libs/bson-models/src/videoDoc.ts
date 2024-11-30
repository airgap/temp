import { bsonPrimitives } from 'from-schema';
const { uid } = bsonPrimitives;
import { cloudflareVideoUpload } from './cloudflareVideoUpload';
import { user } from './user';
import { ObjectBsonSchema } from 'from-schema';

export const videoDoc = {
	bsonType: 'object',
	properties: {
		...cloudflareVideoUpload.properties,
		id: uid,
		author: user.properties.id,
		supertype: 'video',
	},
	required: [...cloudflareVideoUpload.required, 'id', 'author', 'supertype'],
} as const satisfies ObjectBsonSchema;
// console.log('videoDoc', videoDoc);