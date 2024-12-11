import { TsonHandlerModel } from 'from-schema';
import { username } from '@lyku/json-models';
import { user } from '@lyku/json-models';

export const createBot = {
  request: {
    type: 'object',
    properties: {
      username,
    },
    required: ['username'],
  },
  response: {
    type: 'object',
    properties: {
      botId: user.properties.id,
    },
    required: ['botId'],
  },
  authenticated: true,
} as const satisfies TsonHandlerModel;
