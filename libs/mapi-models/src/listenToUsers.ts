import { TsonHandlerModel } from 'from-schema';
import { user } from '@lyku/json-models';

export const listenToUsers = {
  request: { type: 'array', items: user.properties.id },
  response: user,
  stream: true,
  authenticated: false,
} as const satisfies TsonHandlerModel;
