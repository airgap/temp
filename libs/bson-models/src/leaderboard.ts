import { bsonPrimitives } from 'from-schema';
const { uid } = bsonPrimitives;
import { ObjectBsonSchema } from 'from-schema';

export const leaderboard = {
	bsonType: 'object',
	properties: {
		game: uid,
		owner: uid,
		id: uid,
		creator: uid,
	},
	required: ['id', 'game', 'owner', 'creator'],
} as const satisfies ObjectBsonSchema;
