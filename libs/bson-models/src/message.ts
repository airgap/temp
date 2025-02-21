import type { PostgresRecordModel } from 'from-schema';
import { messageContent } from './messageContent';

export const message = {
	properties: {
		author: { type: 'bigint' },
		content: messageContent,
		channel: { type: 'bigint' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		id: { type: 'bigserial', primaryKey: true },
		updated: { type: 'timestamptz' },
	},
	required: ['author', 'content', 'channel', 'created', 'id'],
} as const satisfies PostgresRecordModel;
