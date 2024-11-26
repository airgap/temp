import { user } from '@lyku/json-models';
import { HandlerModel } from 'from-schema';

export const getUser = {
	request: user.properties.username,
	response: user,
	authenticated: false,
} as const satisfies HandlerModel;
