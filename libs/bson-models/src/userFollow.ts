import { bsonPrimitives } from 'from-schema';
const { date, uid } = bsonPrimitives;
import { idBond } from './idBond';
import { ObjectBsonSchema } from 'from-schema';

export const userFollow = {
	bsonType: 'object',
	properties: {
		follower: uid,
		followee: uid,
		id: idBond,
		created: date,
	},
	required: ['created', 'follower', 'followee', 'id'],
} as const satisfies ObjectBsonSchema;
