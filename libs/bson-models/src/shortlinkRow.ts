import { ObjectBsonSchema } from 'from-schema';
import { bsonPrimitives } from 'from-schema';
const { string, uid } = bsonPrimitives;

export const shortlinkRow = {
	bsonType: 'object',
	properties: {
		url: string,
		authorId: uid,
		postId: uid,
	},
	required: ['url'],
} as const satisfies ObjectBsonSchema;
