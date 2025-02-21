import type { PostgresRecordModel } from 'from-schema';

export const gameSession = {
	properties: {
		time: {
			type: 'bigint',
			minimum: 0n,
		},
		edges: {
			type: 'bigint',
			minimum: 0n,
		},
		corners: {
			type: 'bigint',
			minimum: 0n,
		},
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz' },
	},
	required: ['time', 'edges', 'corners', 'created'],
} as const satisfies PostgresRecordModel;
