import { hex } from './hex';
import { username } from './username';
import { PostgresRecordModel } from 'from-schema';

export const userSummary = {
	properties: {
		username,
		live: {
			type: 'boolean',
		},
		chatColor: hex,
		channel: { type: 'bigint' },
		id: { type: 'bigint' },
		joined: { type: 'timestamp' },
		lastLogin: { type: 'timestamp' },
	},
	required: ['channel', 'id', 'chatColor', 'live', 'joined', 'lastLogin'],
} as const satisfies PostgresRecordModel;
