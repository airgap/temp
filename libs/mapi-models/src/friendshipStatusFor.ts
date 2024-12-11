import { TsonHandlerModel } from 'from-schema';
import { friendshipStatus } from '@lyku/json-models';
import { user } from '@lyku/json-models';

export const friendshipStatusFor = {
  request: {
    type: 'object',
    properties: {
      id: user.properties.id,
    },
    required: ['id'],
  },
  response: {
    type: 'object',
    properties: {
      status: friendshipStatus,
    },
    required: ['status'],
  },
  authenticated: true,
} as const satisfies TsonHandlerModel;
