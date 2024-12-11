import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
import { group, groupName } from '@lyku/json-models';
const { boolean, uid } = jsonPrimitives;

export const updateGroup = {
  request: {
    type: 'object',
    properties: {
      id: uid,
      name: groupName,
      private: boolean,
    },
    minProperties: 2,
    required: ['id'],
  },
  response: {
    type: 'object',
    properties: {
      group,
    },
    required: ['group'],
  },
  authenticated: true,
} as const satisfies TsonHandlerModel;
