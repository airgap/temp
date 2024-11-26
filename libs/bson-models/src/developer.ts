import { FromBsonSchema, ObjectBsonSchema, bsonPrimitives } from 'from-schema';
const { string, uid } = bsonPrimitives;

export const developer = {
	bsonType: 'object',
	properties: {
		id: uid,
		homepage: string,
		name: string,
		thumbnail: string,
	},
	required: ['id', 'name', 'homepage'],
} as const satisfies ObjectBsonSchema;
export type Developer = FromBsonSchema<typeof developer>;
