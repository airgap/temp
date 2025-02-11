import type { PostgresRecordModel } from 'from-schema';

export const channelSensitives = {
	properties: {
		id: { type: 'bigint' },
		owner: { type: 'bigint' },
		// Live Input ID - system only - NOT visible
		inputId: { type: 'text' },
		// RTMPS Key - visible ONLY to owning user
		rtmpsKey: { type: 'text' },
		// SRT URL - visible ONLY to owning user
		srtUrl: { type: 'text' },
		// WebRTC (WHIP) URL - visible ONLY to owning user
		whipUrl: { type: 'text' },
	},
	required: [
		'id',
		'owner',
		'inputId',
		'rtmpsKey',
		'srtUrl',
		'whipUrl',
		'whepKey',
	],
} as const satisfies PostgresRecordModel;
