import { FromBsonSchema, StringBsonSchema } from 'from-schema';
import { bsonPrimitives } from 'from-schema';
const { uid } = bsonPrimitives;
const pat = uid.pattern.substring(1, uid.pattern.length - 1);
export const idBond = {
	bsonType: 'string',
	pattern: `^${pat}-${pat}$`,
} as const satisfies StringBsonSchema;
export type IDBond = FromBsonSchema<typeof idBond>;
