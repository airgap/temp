import { StringBsonSchema } from 'from-schema';

export const messageContent = {
	bsonType: 'string',
	minLength: 1,
	maxLength: 300,
} as const satisfies StringBsonSchema;
