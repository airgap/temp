import { bsonPrimitives } from 'from-schema';
const { string, whole, uid } = bsonPrimitives;
import { ttmBoard } from './ttmBoard';
import { user } from './user';
import { ObjectBsonSchema } from 'from-schema';
export const ttmMatch = {
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
		board: ttmBoard,
		// Turn counter
		turn: whole,
		// Timestamp the game was created
		created: string,
		// Timestamp last piece was placed
		lastTurn: string,
		winner: uid,
	},
	required: ['id', 'X', 'O', 'board', 'turn', 'created'],
} as const satisfies ObjectBsonSchema;
