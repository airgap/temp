import type { PostgresRecordModel } from 'from-schema';
import { idBond } from './idBond';

export const leaderboard = {
	properties: {
		game: { type: 'bigint' },
		owner: { type: 'bigint' },
		id: {
			type: 'bigserial',
			primaryKey: true,
		},
		creator: { type: 'bigint' },
		created: { type: 'timestamptz' },
		updated: { type: 'timestamptz' },
	},
	required: ['id', 'game', 'owner', 'creator', 'created', 'updated'],
} as const satisfies PostgresRecordModel;
