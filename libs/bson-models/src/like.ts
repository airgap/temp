import { user } from './user';
import { post } from './post';
import { idBond } from './idBond';
import { FromBsonSchema, ObjectBsonSchema } from 'from-schema';
import { bsonPrimitives } from 'from-schema';
const { string } = bsonPrimitives;

export const like = {
	bsonType: 'object',
	properties: {
		id: idBond,
		userId: user.properties.id,
		postId: post.properties.id,
		created: string,
	},
	required: ['id', 'userId', 'postId', 'created'],
} as const satisfies ObjectBsonSchema;
export type Like = FromBsonSchema<typeof like>;
