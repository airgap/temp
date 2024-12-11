import { ObjectJsonSchema } from 'from-schema';

export const cloudflareVideoWatermark = {
  type: 'object',
  properties: {
    uid: { type: 'string' },
    size: { type: 'number' },
    height: { type: 'integer' },
    width: { type: 'integer' },
    created: { type: 'string' },
    downloadedFrom: { type: 'string' },
    name: { type: 'string' },
    opacity: { type: 'number' },
    padding: { type: 'integer' },
    scale: { type: 'number' },
    position: { type: 'string' },
  },
  required: [
    'uid',
    'size',
    'height',
    'width',
    'created',
    'downloadedFrom',
    'name',
    'opacity',
    'padding',
    'scale',
    'position',
  ],
} as const satisfies ObjectJsonSchema;
