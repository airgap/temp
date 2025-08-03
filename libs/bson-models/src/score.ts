import type { PostgresRecordModel } from 'from-schema';

export const score = {
	properties: {
		id: { type: 'bigserial', primaryKey: true },
		user: { type: 'bigint' },
		channel: { type: 'bigint' },
		reports: { type: 'int' },
		columns: {
			type: 'array',
			items: { type: 'text' },
		},
		leaderboard: { type: 'bigint' },
		game: { type: 'integer' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: {
			type: 'timestamptz',
			generated: { always: true, as: 'CURRENT_TIMESTAMP' },
		},
		deleted: { type: 'timestamptz' },
		verified: { type: 'timestamptz' },
		verifiers: { type: 'array', items: { type: 'bigint' } },
		stream: { type: 'text', maxLength: 100 },
	},
	required: [
		'id',
		'user',
		'reports',
		'columns',
		'leaderboard',
		'game',
		'created',
		'updated',
	],
} as const satisfies PostgresRecordModel;
