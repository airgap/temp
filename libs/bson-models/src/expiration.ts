import { DateBsonSchema, NumberBsonSchema } from 'from-schema';

export const expiration = {
	bsonType: 'date',
	minimum: new Date(Date.now() + 69420),
} as const satisfies DateBsonSchema;
