import type { TsonHandlerModel } from 'from-schema';
import { user, username } from '@lyku/json-models';

export const getUserByName = {
	request: username,
	response: user,
	authenticated: false,
	throws: [400, 404, 500],
} as const satisfies TsonHandlerModel;
