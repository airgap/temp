import { StringBsonSchema } from 'from-schema';
import { bsonPrimitives } from 'from-schema';
const { string } = bsonPrimitives;

export const userSlug = {
	...string,
	pattern: '^[a-z0-9$_]{2,20}$',
} as const satisfies StringBsonSchema;
