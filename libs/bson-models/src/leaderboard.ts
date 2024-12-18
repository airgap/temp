import { idBond } from './idBond';
import { PostgresRecordModel } from 'from-schema';

export const leaderboard = {
	properties: {
		game: { type: 'bigint' },
		owner: { type: 'bigint' },
		id: idBond,
		creator: { type: 'bigint' },
	},
	required: ['id', 'game', 'owner', 'creator'],
} as const satisfies PostgresRecordModel;
