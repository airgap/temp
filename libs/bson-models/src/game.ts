import { FromBsonSchema, ObjectBsonSchema } from 'from-schema';
import { gameStatus } from './gameStatus';
import { bsonPrimitives } from 'from-schema';
const { bool, string, uid } = bsonPrimitives;

export const game = {
	bsonType: 'object',
	properties: {
		background: string,
		developer: uid,
		homepage: string,
		icon: string,
		id: uid,
		publisher: uid,
		thumbnail: string,
		title: string,
		description: string,
		status: gameStatus,
		nsfw: bool,
	},
	required: ['id', 'title', 'status', 'nsfw'],
} as const satisfies ObjectBsonSchema;

export type Game = FromBsonSchema<typeof game>;
