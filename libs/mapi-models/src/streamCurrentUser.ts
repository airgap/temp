import { TsonHandlerModel } from 'from-schema';
import { user } from '@lyku/json-models';

export const streamCurrentUser = {
  response: user,
  authenticated: true,
  stream: true,
} as const satisfies TsonHandlerModel;
