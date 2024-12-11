import { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';
import { likeState } from '@lyku/json-models';

export const getMyLikes = {
  request: { type: 'array', items: post.properties.id },
  response: { type: 'array', items: likeState },
  authenticated: true,
} as const satisfies TsonHandlerModel;
