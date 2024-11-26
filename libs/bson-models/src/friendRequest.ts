import { bsonPrimitives } from 'from-schema';
import { idBond } from './idBond';
const { uid, string } = bsonPrimitives;
import { ObjectBsonSchema } from 'from-schema';

export const friendRequest = {
	bsonType: 'object',
	properties: {
		created: string,
		from: uid,
		id: idBond,
		to: uid,
	},
	required: ['created', 'from', 'id', 'to'],
} as const satisfies ObjectBsonSchema;
