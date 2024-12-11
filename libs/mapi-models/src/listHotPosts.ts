import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
import { post } from '@lyku/json-models';
const { number, uid } = jsonPrimitives;

export const listHotPosts = {
  request: {
    type: 'object',
    properties: {
      groups: {
        type: 'array',
        items: uid,
      },
      tags: {
        type: 'array',
        items: uid,
      },
      before: number,
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
      },
    },
    required: [],
  },
  response: { type: 'array', items: post },
  authenticated: false,
} as const satisfies TsonHandlerModel;
