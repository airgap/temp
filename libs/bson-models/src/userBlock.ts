import { bsonPrimitives } from 'from-schema';
const { date, uid } = bsonPrimitives;
import { idBond } from './idBond';

export const userBlock = {
	type: 'object',
	properties: {
		blockee: uid,
		blocker: uid,
		created: date,
		id: idBond,
	},
	required: ['blockee', 'blocker', 'created', 'id'],
} as const;
