import { StringBsonSchema } from 'from-schema';

export const bio = {
	bsonType: 'string',
	pattern: '^.{0,1024}$',
} as const satisfies StringBsonSchema;
