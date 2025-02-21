import type { PostgresRecordModel } from 'from-schema';
import { ttmBoard } from './ttmBoard';
import { game } from './game';

export const ttmMatch = {
	// primaryKey: 'id',
	properties: {
		// Game ID
		id: { type: 'bigserial', primaryKey: true },
		// Player X's ID
		X: { type: 'bigint' },
		// Player O's ID
		O: { type: 'bigint' },
		// Board string, e.g. 'XXO XO   '
		board: ttmBoard,
		// Turn counter
		turn: { type: 'int' },
		// Timestamp the game was created
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		// Timestamp last piece was placed
		updated: { type: 'timestamptz' },
		winner: { type: 'bigint' },
	},
	required: ['id', 'X', 'O', 'board', 'turn', 'created'],
} as const satisfies PostgresRecordModel;
