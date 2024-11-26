import { StringBsonSchema } from 'from-schema';

export const username = {
	bsonType: 'string',
	pattern: '^(?!.*lyku)[a-zA-Z0-9$_]{2,20}$',
} as const satisfies StringBsonSchema;
