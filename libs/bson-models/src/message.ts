import { messageContent } from './messageContent';
import { bsonPrimitives } from 'from-schema';
import { FromBsonSchema, ObjectBsonSchema } from 'from-schema';
const { date, uid } = bsonPrimitives;

export const message = {
	bsonType: 'object',
	properties: {
		author: uid,
		content: messageContent,
		channel: uid,
		sent: date,
		id: uid,
	},
	required: ['author', 'content', 'channel', 'sent', 'id'],
} as const satisfies ObjectBsonSchema;
export type Message = FromBsonSchema<typeof message>;
