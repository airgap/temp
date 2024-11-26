import { StringBsonSchema } from 'from-schema';

export const tagline = {
	bsonType: 'string',
	minLength: 0,
	maxLength: 255,
} as const satisfies StringBsonSchema;
