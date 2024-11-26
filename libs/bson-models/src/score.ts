import { ObjectBsonSchema } from 'from-schema';
import { bsonPrimitives } from 'from-schema';
const { uid } = bsonPrimitives;

export const score = {
	bsonType: 'object',
	properties: {
		posted: { bsonType: 'date' },
		user: uid,
		channel: uid,
		reports: { bsonType: 'int' },
		columns: {
			bsonType: 'array',
			items: { bsonType: 'double' },
		},
		leaderboard: uid,
		game: uid,
	},
	required: [
		'posted',
		'user',
		'channel',
		'reports',
		'columns',
		'leaderboard',
		'game',
	],
} as const satisfies ObjectBsonSchema;
