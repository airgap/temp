import type { PostgresRecordModel } from 'from-schema';
import { messageContent } from './messageContent';

export const message = {
	properties: {
		author: { type: 'bigint' },
		content: messageContent,
		channel: { type: 'bigint' },
		created: { type: 'timestamp' },
		id: { type: 'bigserial' },
	},
	required: ['author', 'content', 'channel', 'created', 'id'],
} as const satisfies PostgresRecordModel;
