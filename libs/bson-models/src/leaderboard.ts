import type { PostgresRecordModel } from 'from-schema';

export const leaderboard = {
	properties: {
		game: { type: 'bigint' },
		description: { type: 'text', maxLength: 1000 },
		owner: { type: 'bigint' },
		id: {
			type: 'bigserial',
			primaryKey: true,
		},
		title: { type: 'text', maxLength: 50 },
		creator: { type: 'bigint' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz' },
		columnNames: {
			type: 'array',
			items: {
				type: 'text',
				// maxLength: 25,
			},
		},
		columnFormats: {
			type: 'array',
			items: { type: 'text', enum: ['number', 'bigint', 'text', 'time'] },
		},
		columnOrders: {
			type: 'array',
			items: {
				type: 'text',
				enum: ['asc', 'desc'],
			},
		},
		public: { type: 'boolean', default: false },
	},
	required: ['id', 'game', 'owner', 'creator', 'created', 'updated'],
} as const satisfies PostgresRecordModel;
