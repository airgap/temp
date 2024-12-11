import { TsonHandlerModel } from 'from-schema';
import { user } from '@lyku/json-models';

export const amIFollowing = {
  request: user.properties.id,
  response: {
    type: 'object',
    properties: {
      following: { type: 'boolean' },
    },
    required: ['following'],
  },
  authenticated: true,
} as const satisfies TsonHandlerModel;
