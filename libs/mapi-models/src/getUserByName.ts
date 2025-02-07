import type { TsonHandlerModel } from 'from-schema';
import { user, username } from '@lyku/json-models';

export const getUserByName = {
	request: username,
	response: user,
	authenticated: false,
} as const satisfies TsonHandlerModel;
