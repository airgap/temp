import { FromBsonSchema, StringBsonSchema } from 'from-schema';
export const hex = {
	bsonType: 'string',
	pattern: '^[0-9A-Fa-f]{6}$',
} as const satisfies StringBsonSchema;
export type Hex = FromBsonSchema<typeof hex>;
