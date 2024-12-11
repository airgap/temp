import { messageContent } from './messageContent';
import { PostgresRecordModel } from 'from-schema';
import { channel } from './channel';
import { user } from './user';

export const message = {
  properties: {
    author: { type: 'bigint' },
    content: messageContent,
    channel: { type: 'bigint' },
    sent: { type: 'timestamp' },
    id: { type: 'bigserial' },
  },
  required: ['author', 'content', 'channel', 'sent', 'id'],
} as const satisfies PostgresRecordModel;
