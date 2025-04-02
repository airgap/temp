import type { TsonHandlerModel } from 'from-schema';
import { notification } from '@lyku/json-models';

export const listenForNotifications = {
	response: notification,
	stream: true,
	authenticated: true,
	throws: [400, 401, 500],
} as const satisfies TsonHandlerModel;
