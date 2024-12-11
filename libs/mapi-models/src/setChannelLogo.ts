import { channel } from '@lyku/json-models';
import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
const { string, uid } = jsonPrimitives;

export const setChannelLogo = {
  request: {
    type: 'object',
    properties: {
      data: string,
      channel: uid,
    },
    required: ['data', 'channel'],
  },
  response: {
    type: 'object',
    properties: {
      channel,
    },
    required: ['channel'],
  },
  authenticated: true,
} as const satisfies TsonHandlerModel;
