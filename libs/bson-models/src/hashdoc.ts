import { ObjectBsonSchema } from 'from-schema';
import { username } from './username';
import { user } from './user';
import { bsonPrimitives } from 'from-schema';
const { string, email } = bsonPrimitives;

export const hashdoc = {
	bsonType: 'object',
	properties: {
		email,
		hash: string,
		id: user.properties.id,
		username,
	},
	required: ['email', 'hash', 'id', 'username'],
} as const satisfies ObjectBsonSchema;
