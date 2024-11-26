import { sessionId } from './sessionId';
import { userLogin } from './userLogin';
import { DateBsonSchema, ObjectBsonSchema } from 'from-schema';
export const session = {
	bsonType: 'object',
	properties: {
		...userLogin.properties,
		id: sessionId,
		expiration: { bsonType: 'date' },
	},
	required: [...userLogin.required, 'expiration'],
} as const satisfies ObjectBsonSchema;
