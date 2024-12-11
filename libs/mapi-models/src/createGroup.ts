import { TsonHandlerModel } from 'from-schema';
import { group } from '@lyku/json-models';

export const createGroup = {
  request: {
    type: 'object',
    properties: {
      name: group.properties.name,
      id: group.properties.id,
      private: { type: 'boolean' },
    },
    required: ['name', 'id', 'private'],
  },
  response: group,
  authenticated: true,
} as const satisfies TsonHandlerModel;
