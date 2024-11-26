import { FromBsonSchema, StringBsonSchema } from 'from-schema';

export const sessionId = {
	description: "User's session ID",
	bsonType: 'string',
	pattern: '^[a-zA-Z0-9+/=]{44}$',
} as const satisfies StringBsonSchema;
export type SessionId = FromBsonSchema<typeof sessionId>;
