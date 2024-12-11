import { TsonHandlerModel } from 'from-schema';
import { group } from '@lyku/json-models';

export const deleteGroup = {
  request: {
    type: 'object',
    properties: {
      id: group.properties.id,
    },
    required: ['id'],
  },
  response: { type: 'object', properties: { group } },
  authenticated: true,
} as const satisfies TsonHandlerModel;
