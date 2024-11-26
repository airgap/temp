import { FromBsonSchema, StringBsonSchema } from 'from-schema';

export const ttfBoard = {
	bsonType: 'string',
	pattern: '^[XO-]{9}$',
} as const satisfies StringBsonSchema;
export type TtfBoard = FromBsonSchema<typeof ttfBoard>;
