import { StringBsonSchema } from 'from-schema';

export const ttmBoard = {
	bsonType: 'string',
	pattern: '^[XO-]{25}$',
} as const satisfies StringBsonSchema;
