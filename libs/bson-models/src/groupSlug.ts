import { StringBsonSchema } from 'from-schema';

export const groupSlug = {
	bsonType: 'string',
	pattern: '^[a-zA-Z0-9_]{3,20}$',
} as const satisfies StringBsonSchema;
