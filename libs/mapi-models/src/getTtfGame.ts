import { TsonHandlerModel } from 'from-schema';
import { ttfMatch } from '@lyku/json-models';
export const getTtfGame = {
  request: {
    type: 'object',
    properties: {
      id: ttfMatch.properties.id,
    },
    required: ['id'],
  },
  response: {
    type: 'object',
    properties: {},
  },
  authenticated: true,
} as const satisfies TsonHandlerModel;
