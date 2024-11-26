import { HandlerModel } from 'from-schema';
import { user } from '@lyku/json-models';

export const getCurrentUser = {
	response: user,
	authenticated: false,
} as const satisfies HandlerModel;
