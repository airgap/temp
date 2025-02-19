import type { PostgresRecordModel } from 'from-schema';

export const matchProposal = {
	properties: {
		// Timestamp the game was created
		created: { type: 'timestamptz' },
		// User ID of the user proposing the match
		from: { type: 'bigint' },
		// Game ID of the game being proposed
		game: { type: 'integer' },
		// Proposal ID
		id: { type: 'bigserial', primaryKey: true },
		// User ID of the user being proposed to
		to: { type: 'bigint' },
	},
	required: ['created', 'from', 'game', 'id', 'to'],
} as const satisfies PostgresRecordModel;
