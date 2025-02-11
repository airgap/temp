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
	},
	required: ['time', 'edges', 'corners'],
} as const satisfies PostgresRecordModel;
