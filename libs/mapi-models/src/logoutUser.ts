import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
import { sessionId } from '@lyku/json-models';

export const logoutUser = {
  request: {
    type: 'object',
    properties: {
      sessionId,
      everywhere: {
        type: 'boolean',
      },
    },
    required: [],
  },
  response: {
    type: 'object',
    properties: {
      deleted: {
        type: 'number',
        minimum: 0,
      },
      logoutUser: '',
    },
    required: ['deleted'],
  },
  authenticated: true,
} as const satisfies TsonHandlerModel;
