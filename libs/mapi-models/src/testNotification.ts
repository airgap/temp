import type { TsonHandlerModel } from 'from-schema';
import { removeKeys } from '@lyku/helpers';
import { notification } from '@lyku/json-models';
const genericNotification = removeKeys(notification.properties, 'id', 'user');
const genericKeys = Object.keys(genericNotification);
export const testNotification = {
	request: {
		type: 'object',
		properties: genericNotification,
		required: notification.required.filter((k) => genericKeys.includes(k)),
	},
	response: notification,
	authenticated: true,
	throws: [400, 401, 409, 500],
} as const satisfies TsonHandlerModel;
