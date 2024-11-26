import { StringBsonSchema } from 'from-schema';

export const postBody = {
	description: 'The text body of a microblog post',
	pattern: '^.{,1337}$',
	bsonType: 'string',
	minLength: 1,
	maxLength: 1337,
} as const satisfies StringBsonSchema;
