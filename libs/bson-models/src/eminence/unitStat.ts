import { FromBsonSchema, ObjectBsonSchema } from 'from-schema';
import { bsonPrimitives } from 'from-schema';
const { int, string } = bsonPrimitives;

export const unitStat = {
	bsonType: 'object',
	properties: {
		name: string,
		base: int,
		minimum: int,
		maximum: int,
	},
	required: ['name', 'base', 'minimum'],
} as const satisfies ObjectBsonSchema;
export type UnitStat = FromBsonSchema<typeof unitStat>;
