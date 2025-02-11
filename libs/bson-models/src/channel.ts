import type { PostgresRecordModel } from 'from-schema';
import { bio } from './bio';
import { channelName } from './channelName';
import { channelSlug } from './channelSlug';
import { hex } from './hex';
import { tagline } from './tagline';
import { userId } from './user';
export const channel = {
	properties: {
		live: { type: 'boolean' },
		fgColor: hex,
		bgColor: hex,
		tvColor: hex,
		id: { type: 'bigserial' },
		owner: userId,
		logo: { type: 'varchar', minLength: 5, maxLength: 50 },
		created: { type: 'timestamp' },
		name: channelName,
		slug: channelSlug,
		tagline,
		bio,
		activeBg: { type: 'varchar', minLength: 5, maxLength: 50 },
		awayBg: { type: 'varchar', minLength: 5, maxLength: 50 },
		totalStreamTime: { type: 'double precision' },
		// Derived from WebRTC (WHEP) Playback URL
		// - include with channel summary for stream player
		whepKey: { type: 'varchar', minLength: 5, maxLength: 50 },
	},
	required: ['id', 'name', 'slug', 'owner', 'live', 'input', 'created'],
} as const satisfies PostgresRecordModel;
