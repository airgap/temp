import { StringBsonSchema } from 'from-schema';

export const postTitle = {
	description: 'A post containing text, images, or videos',
	bsonType: 'string',
	minLength: 1,
	maxLength: 100,
} as const satisfies StringBsonSchema;
