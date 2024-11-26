import { FromBsonSchema, ObjectBsonSchema } from 'from-schema';
import { bsonPrimitives } from 'from-schema';
const { date, string, uid } = bsonPrimitives;
import { user } from './user';

export const notification = {
	bsonType: 'object',
	properties: {
		id: uid,
		user: user.properties.id,
		title: string,
		subtitle: string,
		body: string,
		icon: string,
		href: string,
		posted: date,
	},
	required: ['id', 'user', 'title', 'body', 'icon', 'posted'],
} as const satisfies ObjectBsonSchema;
export type Notification = FromBsonSchema<typeof notification>;
