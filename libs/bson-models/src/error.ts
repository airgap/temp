import { StringBsonSchema, bsonPrimitives } from 'from-schema';
const { string } = bsonPrimitives;

export const error = {
	...string,
	description: 'The first error encountered, if any',
} as const satisfies StringBsonSchema;
