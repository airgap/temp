import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
import { post } from '@lyku/json-models';
const { uid, number } = jsonPrimitives;

export const listFeedPostsUnauthenticated = {
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
    },
    required: [],
  },
  response: { type: 'array', items: post },
  authenticated: false,
} as const satisfies TsonHandlerModel;
