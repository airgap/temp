import { hex } from './hex';
import { username } from './username';
import { userSlug } from './userSlug';
import { BigSerialColumnModel, PostgresRecordModel } from 'from-schema';
import { uuidv4 } from './uuid';

export const userId = {
	type: 'bigserial',
} as const satisfies BigSerialColumnModel;

export const user = {
	properties: {
		banned: {
			type: 'boolean',
		},
		confirmed: {
			type: 'boolean',
		},
		bot: {
			type: 'boolean',
			description: 'Whether or not this user is a bot',
		},
		groupLimit: {
			type: 'integer',
			minimum: 0,
			description: 'Maximum number of groups this user can create',
		},
		chatColor: hex,
		id: userId,
		joined: { type: 'timestamp' },
		live: { type: 'boolean' },
		profilePicture: uuidv4,
		staff: {
			type: 'boolean',
			description: 'Whether the user is a member of Lyku staff',
		},
		username,
		channelLimit: { type: 'integer' },
		slug: userSlug,
		points: { type: 'double precision' },
		postCount: { type: 'bigint' },
		lastLogin: { type: 'timestamp' },
		lastSuper: { type: 'timestamp' },
		owner: { type: 'bigint' },
	},
	required: [
		'banned',
		'confirmed',
		'bot',
		'chatColor',
		'id',
		'joined',
		'live',
		'lastLogin',
		'username',
		'points',
		'slug',
		'lastLogin',
		'staff',
	],
} as const satisfies PostgresRecordModel;
