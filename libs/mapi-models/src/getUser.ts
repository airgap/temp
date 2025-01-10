import { user } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

export const getUser = {
	request: user.properties.id,
	response: user,
	authenticated: false,
} as const satisfies TsonHandlerModel;
