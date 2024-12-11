import { TsonHandlerModel, NumberTsonSchema } from 'from-schema';
import { post } from '@lyku/json-models';

const request = {
  ...post.properties.id,
  description: 'Remove a Like from someones post',
} as const satisfies NumberTsonSchema;

export const unlikePost = {
  request,
  response: post.properties.likes,
  authenticated: true,
} as const satisfies TsonHandlerModel;
