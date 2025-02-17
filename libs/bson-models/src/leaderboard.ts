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
	},
	required: ['id', 'game', 'owner', 'creator'],
} as const satisfies PostgresRecordModel;
