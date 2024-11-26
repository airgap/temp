import { bsonPrimitives } from 'from-schema';
const { date, string, uid } = bsonPrimitives;
import { ObjectBsonSchema } from 'from-schema';

export const userLogin = {
	bsonType: 'object',
	properties: {
		id: uid,
		userId: uid,
		ip: string,
		created: date,
	},
	required: ['id', 'userId', 'ip', 'created'],
} as const satisfies ObjectBsonSchema;
