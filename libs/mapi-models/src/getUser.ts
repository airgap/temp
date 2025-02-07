import type { TsonHandlerModel } from 'from-schema';
import { user } from '@lyku/json-models';

export const getUser = {
	request: user.properties.id,
	response: user,
	authenticated: false,
} as const satisfies TsonHandlerModel;
