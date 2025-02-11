import type { BigSerialColumnModel, PostgresRecordModel } from 'from-schema';
import { hex } from './hex';
import { username } from './username';
import { userSlug } from './userSlug';

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
		profilePicture: { type: 'text' },
		staff: {
			type: 'boolean',
			description: 'Whether the user is a member of Lyku staff',
		},
		username,
		channelLimit: { type: 'integer' },
		slug: userSlug,
		points: { type: 'bigint' },
		postCount: { type: 'bigint' },
		lastLogin: { type: 'timestamp' },
		lastSuper: { type: 'timestamp' },
		owner: { type: 'bigint' },
		name: { type: 'text', maxLength: 30, minLength: 3 },
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
		'groupLimit',
		'lastSuper',
		'postCount',
	],
} as const satisfies PostgresRecordModel;
