import { StringBsonSchema } from 'from-schema';

export const emptyResponse = {
	bsonType: 'string',
	minLength: 0,
} as const satisfies StringBsonSchema;
