import { StringBsonSchema } from 'from-schema';

export const password = {
	bsonType: 'string',
	pattern: '^.{10,50}$',
} as const satisfies StringBsonSchema;
