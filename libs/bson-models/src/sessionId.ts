import { CharColumnModel, FromBsonSchema } from 'from-schema';

export const sessionId = {
	description: "User's session ID",
	type: 'character',
	length: 44,
	pattern: '^[a-zA-Z0-9+/=]{44}$',
} as const satisfies CharColumnModel;
