import { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';
import { like } from '@lyku/json-models';

export const listenToLikesOnPosts = {
  request: { type: 'array', items: post.properties.id },
  response: like,
  stream: true,
  authenticated: true,
} as const satisfies TsonHandlerModel;
