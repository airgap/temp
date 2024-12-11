import { PostgresRecordModel } from 'from-schema';

export const imageDoc = {
  properties: {
    id: { type: 'text' },
    // metadata: {
    // 	type: 'object',
    // 	properties: {},
    // },
    uploaded: { type: 'text' },
    requireSignedURLs: { type: 'boolean' },
    variants: {
      type: 'array',
      items: { type: 'text' },
    },
    draft: { type: 'boolean' },
    channel: { type: 'text' },
  },
  required: ['id', 'uploaded', 'requireSignedURLs', 'variants'],
} as const satisfies PostgresRecordModel;
