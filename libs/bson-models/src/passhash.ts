import { StringBsonSchema } from 'from-schema';

export const passhash = {
	bsonType: 'string',
} as const satisfies StringBsonSchema;
