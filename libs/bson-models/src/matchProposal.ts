import { bsonPrimitives } from 'from-schema';
const { date, uid } = bsonPrimitives;
import { user } from './user';
import { game } from './game';
import { FromBsonSchema, ObjectBsonSchema } from 'from-schema';

export const matchProposal = {
	bsonType: 'object',
	properties: {
		// Timestamp the game was created
		created: date,
		from: user.properties.id,
		game: game.properties.id,
		// Proposal ID
		id: uid,
		to: user.properties.id,
	},
	required: ['created', 'from', 'game', 'id', 'to'],
} as const satisfies ObjectBsonSchema;
export type MatchProposal = FromBsonSchema<typeof matchProposal>;
