import { TsonHandlerModel } from 'from-schema';
import { user } from '@lyku/json-models';

export const getCurrentUser = {
	response: user,
	authenticated: true,
} as const satisfies TsonHandlerModel;
