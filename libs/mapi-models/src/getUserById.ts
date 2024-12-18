import { user } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

export const getUserById = {
	request: user.properties.id,
	response: user,
	authenticated: false,
} as const satisfies TsonHandlerModel;
