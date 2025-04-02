import type { TsonHandlerModel } from 'from-schema';
import { user } from '@lyku/json-models';

export const listenToUsers = {
	request: { type: 'array', items: user.properties.id },
	response: user,
	stream: true,
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
