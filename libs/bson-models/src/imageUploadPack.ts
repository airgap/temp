import { JsonSchema, PostgresRecordModel } from 'from-schema';

export const imageUploadPack = {
  type: 'object',
  description:
    'Either the information you need to upload an image or video attachment, or any errors encountered',
  properties: {
    id: { type: 'string' },
    uploadURL: { type: 'string' },
  },
  required: ['id', 'uploadURL'],
} as const satisfies JsonSchema;
