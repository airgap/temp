import { bsonPrimitives, PostgresRecordModel } from 'from-schema';
import { ttfBoard } from './ttfBoard';

export const ttfMatch = {
	properties: {
		// Game ID
		id: { type: 'bigserial' },
		// Player X's ID
		X: { type: 'bigint' },
		// Player O's ID
		O: { type: 'bigint' },
		// Board string, e.g. 'XXO XO   '
		board: ttfBoard,
		// Turn counter
		turn: { type: 'integer' },
		// ID of the user whose turn it is
		whoseTurn: { type: 'bigint' },
		// Timestamp the game was created
		created: { type: 'timestamp' },
		// Timestamp last piece was placed
		lastTurn: { type: 'timestamp' },
		winner: { type: 'bigint' },
	},
	required: ['id', 'X', 'O', 'board', 'turn', 'created'],
} as const satisfies PostgresRecordModel;
