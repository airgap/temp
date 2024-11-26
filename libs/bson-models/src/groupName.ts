import { StringBsonSchema } from 'from-schema';

export const groupName = {
	bsonType: 'string',
	pattern: '^.{3,30}$',
} as const satisfies StringBsonSchema;
