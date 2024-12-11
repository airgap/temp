import { TsonHandlerModel } from 'from-schema';
import { friendshipStatus } from '@lyku/json-models';
import { user } from '@lyku/json-models';

export const deleteFriendship = {
  request: user.properties.id,
  response: {
    type: 'object',
    properties: {
      status: friendshipStatus,
    },
    required: ['friendshipStatus'],
  },
  authenticated: true,
} as const satisfies TsonHandlerModel;
