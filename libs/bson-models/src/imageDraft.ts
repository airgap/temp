import { imageUploadReason } from './imageUploadReason';
import { PostgresRecordModel } from 'from-schema';

export const imageDraft = {
  description:
    'Either the information you need to upload an image or video attachment, or any errors encountered',
  properties: {
    user: { type: 'bigint' },
    channel: { type: 'bigint' },
    post: { type: 'bigint' },
    reason: imageUploadReason,
    id: { type: 'text' },
    uploadURL: { type: 'text' },
    created: { type: 'timestamp' },
  },
  required: ['id', 'user', 'reason', 'uploadURL', 'created'],
} as const satisfies PostgresRecordModel;
