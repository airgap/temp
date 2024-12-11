import { bsonPrimitives, PostgresRecordModel } from 'from-schema';
import { ttmBoard } from './ttmBoard';
import { user } from './user';
import { game } from './game';

export const ttmMatch = {
  // primaryKey: 'id',
  properties: {
    // Game ID
    id: game.properties.id,
    // Player X's ID
    X: { type: 'bigint' },
    // Player O's ID
    O: { type: 'bigint' },
    // Board string, e.g. 'XXO XO   '
    board: ttmBoard,
    // Turn counter
    turn: { type: 'int' },
    // Timestamp the game was created
    created: { type: 'timestamp' },
    // Timestamp last piece was placed
    lastTurn: { type: 'timestamp' },
    winner: { type: 'bigint' },
  },
  required: ['id', 'X', 'O', 'board', 'turn', 'created'],
} as const satisfies PostgresRecordModel;
