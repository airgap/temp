import { username } from '@lyku/json-models';
import { user } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

export const getUsers = {
  request: {
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: username,
      },
    },
    required: ['users'],
  },
  response: {
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: user,
      },
    },
    required: ['users'],
  },
  authenticated: false,
} as const satisfies TsonHandlerModel;
