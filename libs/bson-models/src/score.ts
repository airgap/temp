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
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz' },
		deleted: { type: 'timestamptz' },
		verified: { type: 'timestamptz' },
		verifiers: { type: 'array', items: { type: 'bigint' } },
		stream: { type: 'text', maxLength: 100 },
	},
	required: [
		'posted',
		'user',
		'channel',
		'reports',
		'columns',
		'leaderboard',
		'game',
		'created',
		'updated',
	],
} as const satisfies PostgresRecordModel;
