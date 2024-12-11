import { TsonHandlerModel } from 'from-schema';

export const getTusEndpoint = {
  response: {
    type: 'object',
    properties: {},
    required: ['post'],
  },
} as const satisfies TsonHandlerModel;
