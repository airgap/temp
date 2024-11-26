import { StringBsonSchema } from 'from-schema';

export const channelSlug = {
	bsonType: 'string',
	pattern: '^[a-z0-9]{3,30}$',
} as const satisfies StringBsonSchema;
