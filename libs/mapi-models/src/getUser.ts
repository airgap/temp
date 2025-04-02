import type { TsonHandlerModel } from 'from-schema';
import { user } from '@lyku/json-models';

export const getUser = {
	request: { oneOf: [user.properties.id, user.properties.slug] },
	response: user,
	authenticated: false,
	throws: [400, 404, 500],
} as const satisfies TsonHandlerModel;
