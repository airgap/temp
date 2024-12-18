import { PostgresRecordModel } from 'from-schema';

export const channelSensitives = {
	properties: {
		id: { type: 'bigint' },
		// Live Input ID - system only - NOT visible
		inputId: { type: 'text' },
		// RTMPS Key - visible ONLY to owning user
		rtmpsKey: { type: 'text' },
		// SRT URL - visible ONLY to owning user
		srtUrl: { type: 'text' },
		// WebRTC (WHIP) URL - visible ONLY to owning user
		whipUrl: { type: 'text' },
	},
	required: ['id', 'inputId', 'rtmpsKey', 'srtUrl', 'whipUrl', 'whepKey'],
} as const satisfies PostgresRecordModel;
