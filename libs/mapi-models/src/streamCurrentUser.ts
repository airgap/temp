import type { TsonHandlerModel } from 'from-schema';
import { user } from '@lyku/json-models';

export const streamCurrentUser = {
	response: user,
	authenticated: true,
	stream: true,
	throws: [400, 401, 500],
} as const satisfies TsonHandlerModel;
