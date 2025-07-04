import type {
	BigIntColumnModel,
	BigSerialColumnModel,
	PostgresRecordModel,
} from 'from-schema';
import { hex } from './hex';
import { username } from './username';
import { userSlug } from './userSlug';

export const userId = {
	type: 'bigint',
} as const satisfies BigIntColumnModel;

export const user = {
	properties: {
		banned: {
			type: 'timestamptz',
		},
		confirmed: {
			type: 'timestamptz',
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
		id: {
			...userId,
			primaryKey: true,
			type: 'bigserial',
		},
		joined: { type: 'timestamptz' },
		live: { type: 'boolean' },
		profilePicture: { type: 'text' },
		staff: {
			type: 'boolean',
			description: 'Whether the user is a member of Lyku staff',
		},
		username: {
			...username,
			unique: true,
		},
		channelLimit: { type: 'integer' },
		slug: userSlug,
		points: { type: 'bigint' },
		postCount: { type: 'bigint' },
		lastLogin: { type: 'timestamptz' },
		lastSuper: { type: 'timestamptz' },
		owner: { type: 'bigint' },
		name: { type: 'text', maxLength: 30, minLength: 3 },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz' },
		deleted: { type: 'timestamptz' },
	},
	required: [
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
		'created',
	],
} as const satisfies PostgresRecordModel;
