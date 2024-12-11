import { PostgresRecordModel } from 'from-schema';

export const videoDraft = {
  description:
    'Either the information you need to upload an image or video attachment, or any errors encountered',
  properties: {
    user: { type: 'bigint' },
    channel: { type: 'bigint' },
    post: { type: 'bigint' },
    uid: { type: 'text', maxLength: 32 },
    uploadURL: { type: 'text' },
    created: { type: 'timestamp' },
  },
  required: ['user', 'channel', 'post', 'uid', 'uploadURL', 'created'],
} as const satisfies PostgresRecordModel;
