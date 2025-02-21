import type { PostgresRecordModel } from 'from-schema';
import { hex } from './hex';
import { username } from './username';

export const userSummary = {
	properties: {
		username,
		live: {
			type: 'boolean',
		},
		chatColor: hex,
		channel: { type: 'bigint' },
		id: { type: 'bigint', primaryKey: true },
		joined: { type: 'timestamptz' },
		lastLogin: { type: 'timestamptz' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz' },
	},
	required: [
		'channel',
		'id',
		'chatColor',
		'live',
		'joined',
		'lastLogin',
		'username',
		'created',
	],
} as const satisfies PostgresRecordModel;
