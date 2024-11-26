import { bsonPrimitives } from 'from-schema';
import { bio } from './bio';
import { channelName } from './channelName';
import { channelSlug } from './channelSlug';
import { hex } from './hex';
import { tagline } from './tagline';
import { FromBsonSchema, ObjectBsonSchema } from 'from-schema';
const { string, double, uid } = bsonPrimitives;
export const channel = {
	bsonType: 'object',
	properties: {
		live: {
			bsonType: 'bool',
		},
		fgColor: hex,
		bgColor: hex,
		tvColor: hex,
		id: uid,
		owner: uid,
		logo: string,
		created: string,
		name: channelName,
		slug: channelSlug,
		tagline,
		bio,
		activeBg: string,
		awayBg: string,
		totalStreamTime: double,
		// Derived from WebRTC (WHEP) Playback URL
		// - include with channel summary for stream player
		whepKey: string,
	},
	required: ['id', 'name', 'slug', 'owner', 'live', 'input', 'created'],
} as const satisfies ObjectBsonSchema;
export type Channel = FromBsonSchema<typeof channel>;
