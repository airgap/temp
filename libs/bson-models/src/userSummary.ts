import { hex } from './hex';
import { username } from './username';
import { bsonPrimitives } from 'from-schema';
const { uid } = bsonPrimitives;

export const userSummary = {
	type: 'object',
	properties: {
		username,
		live: {
			type: 'boolean',
		},
		chatColor: hex,
		channel: uid,
		id: uid,
		joined: {
			type: 'number',
			minimum: 0,
		},
		lastLogin: {
			type: 'number',
			minimum: 0,
		},
	},
	required: ['channel', 'id', 'chatColor', 'live', 'joined', 'lastLogin'],
} as const;
