import { FromBsonSchema, ObjectBsonSchema } from 'from-schema';
import { idBond } from './idBond';
import { bsonPrimitives } from 'from-schema';
const { string, uid } = bsonPrimitives;

export const friendship = {
	bsonType: 'object',
	properties: {
		created: string,
		id: idBond,
		users: {
			bsonType: 'array',
			minItems: 2,
			maxItems: 2,
			items: uid,
		},
	},
	required: ['created', 'id', 'users'],
} as const satisfies ObjectBsonSchema;
