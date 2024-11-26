import { ObjectBsonSchema } from 'from-schema';
import { bsonPrimitives } from 'from-schema';
const { uid, string } = bsonPrimitives;

export const publisher = {
	bsonType: 'object',
	properties: {
		id: uid,
		homepage: string,
		name: string,
	},
	required: ['id', 'name', 'homepage'],
} as const satisfies ObjectBsonSchema;
