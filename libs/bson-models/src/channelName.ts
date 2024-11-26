import { StringBsonSchema } from 'from-schema';

export const channelName = {
	bsonType: 'string',
	pattern: '^[a-zA-Z0-9]{3,30}$',
} as const satisfies StringBsonSchema;
