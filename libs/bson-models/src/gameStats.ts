import type { PostgresRecordModel } from 'from-schema';

export const btvGameStats = {
	properties: {
		user: { type: 'bigint' },
		totalTime: {
			type: 'double precision',
			minimum: 0,
		},
		totalEdges: {
			type: 'bigint',
			minimum: 0n,
		},
		totalCorners: {
			type: 'bigint',
			minimum: 0n,
		},
		currentTime: {
			type: 'double precision',
			minimum: 0,
		},
		currentEdges: {
			type: 'bigint',
			minimum: 0n,
		},
		currentCorners: {
			type: 'bigint',
			minimum: 0n,
		},
		highestTime: {
			type: 'double precision',
			minimum: 0,
		},
		highestEdges: {
			type: 'bigint',
			minimum: 0n,
		},
		highestCorners: {
			type: 'bigint',
			minimum: 0n,
		},
		sessionCount: {
			type: 'bigint',
			minimum: 0n,
		},
	},
	required: [
		'totalTime',
		'totalEdges',
		'totalCorners',
		'currentTime',
		'currentEdges',
		'currentCorners',
		'highestTime',
		'highestEdges',
		'highestCorners',
		'sessionCount',
	],
} as const satisfies PostgresRecordModel;
