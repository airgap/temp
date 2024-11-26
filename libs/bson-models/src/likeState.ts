import { bsonPrimitives } from 'from-schema';
const { bool } = bsonPrimitives;
import { post } from './post';
import { FromBsonSchema, ObjectBsonSchema } from 'from-schema';

export const likeState = {
	bsonType: 'object',
	properties: {
		id: post.properties.id,
		liked: bool,
	},
	required: ['id', 'liked'],
} as const satisfies ObjectBsonSchema;

export type LikeState = FromBsonSchema<typeof likeState>;
