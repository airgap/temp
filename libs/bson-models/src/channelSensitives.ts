import type { PostgresRecordModel } from 'from-schema';

export const channelSensitives = {
	properties: {
		id: { type: 'bigint', primaryKey: true },
		owner: { type: 'bigint' },
		// Live Input ID - system only - NOT visible
		inputId: { type: 'text' },
		// RTMPS Key - visible ONLY to owning user
		rtmpsKey: { type: 'text' },
		// SRT URL - visible ONLY to owning user
		srtUrl: { type: 'text' },
		// WebRTC (WHIP) URL - visible ONLY to owning user
		whipUrl: { type: 'text' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz' },
	},
	required: [
		'id',
		'owner',
		'inputId',
		'rtmpsKey',
		'srtUrl',
		'whipUrl',
		'whepKey',
		'created',
	],
} as const satisfies PostgresRecordModel;
