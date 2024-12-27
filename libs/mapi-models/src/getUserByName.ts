import { user, username } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

export const getUserByName = {
	request: username,
	response: user,
	authenticated: false,
} as const satisfies TsonHandlerModel;
