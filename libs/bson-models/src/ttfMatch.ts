import { bsonPrimitives } from 'from-schema';
const { string, whole, uid } = bsonPrimitives;
import { ttfBoard } from './ttfBoard';
import { user } from './user';
import { FromBsonSchema, ObjectBsonSchema } from 'from-schema';
export const ttfMatch = {
	// primaryKey: 'id',
	bsonType: 'object',
	properties: {
		// Game ID
		id: uid,
		// Player X's ID
		X: user.properties.id,
		// Player O's ID
		O: user.properties.id,
		// Board string, e.g. 'XXO XO   '
		board: ttfBoard,
		// Turn counter
		turn: whole,
		// ID of the user whose turn it is
		whoseTurn: user.properties.id,
		// Timestamp the game was created
		created: string,
		// Timestamp last piece was placed
		lastTurn: string,
		winner: user.properties.id,
	},
	required: ['id', 'X', 'O', 'board', 'turn', 'created'],
} as const satisfies ObjectBsonSchema;
export type TtfMatch = FromBsonSchema<typeof ttfMatch>;
