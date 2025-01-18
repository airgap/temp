import { messageContent } from './messageContent';
import { PostgresRecordModel } from 'from-schema';

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
