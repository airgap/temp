import { bsonPrimitives } from 'from-schema';
import { channel } from './channel';
import { FromBsonSchema, ObjectBsonSchema } from 'from-schema';
const { string } = bsonPrimitives;

export const channelSensitives = {
	bsonType: 'object',
	properties: {
		id: channel.properties.id,
		// Live Input ID - system only - NOT visible
		inputId: string,
		// RTMPS Key - visible ONLY to owning user
		rtmpsKey: string,
		// SRT URL - visible ONLY to owning user
		srtUrl: string,
		// WebRTC (WHIP) URL - visible ONLY to owning user
		whipUrl: string,
	},
	required: ['id', 'inputId', 'rtmpsKey', 'srtUrl', 'whipUrl', 'whepKey'],
} as const satisfies ObjectBsonSchema;
export type ChannelSensitives = FromBsonSchema<typeof channelSensitives>;
