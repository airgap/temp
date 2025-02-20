import type { PostgresRecordModel } from 'from-schema';

export const score = {
	properties: {
		id: { type: 'bigserial', primaryKey: true },
		posted: { type: 'timestamptz' },
		user: { type: 'bigint' },
		channel: { type: 'bigint' },
		reports: { type: 'int' },
		columns: {
			type: 'array',
			items: { type: 'bigint' },
		},
		leaderboard: { type: 'bigint' },
		game: { type: 'bigint' },
	},
	required: [
		'posted',
		'user',
		'channel',
		'reports',
		'columns',
		'leaderboard',
		'game',
	],
} as const satisfies PostgresRecordModel;
