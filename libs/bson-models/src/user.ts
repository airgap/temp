import { hex } from './hex';
import { username } from './username';
import { userSlug } from './userSlug';
import { bsonPrimitives } from 'from-schema';
const { bool, date, double, uid, whole, uuidv4 } = bsonPrimitives;
import { EnumBsonSchema, FromBsonSchema, ObjectBsonSchema } from 'from-schema';

export const special = {
	enum: ['cowboy', 'sombrero'],
} as const satisfies EnumBsonSchema;

export const user = {
	bsonType: 'object',
	properties: {
		banned: bool,
		confirmed: bool,
		bot: {
			...bool,
			description: 'Whether or not this user is a bot',
		},
		groupLimit: {
			...whole,
			description: 'Maximum number of groups this user can create',
		},
		chatColor: hex,
		id: uid,
		joined: date,
		live: bool,
		ownerId: uid,
		profilePicture: uuidv4,
		staff: {
			...bool,
			description: 'Whether the user is a member of Lyku staff',
		},
		username,
		channelLimit: whole,
		specials: {
			bsonType: 'array',
			items: special,
		},
		slug: userSlug,
		points: double,
		postCount: whole,
		lastLogin: {
			bsonType: 'date',
		},
		lastSuper: date,
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
	],
} as const satisfies ObjectBsonSchema;
export type User = FromBsonSchema<typeof user>;
