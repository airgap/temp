import { TsonHandlerModel } from 'from-schema';
import { notification } from '@lyku/json-models';

export const listenForNotifications = {
  response: notification,
  stream: true,
  authenticated: true,
} as const satisfies TsonHandlerModel;
