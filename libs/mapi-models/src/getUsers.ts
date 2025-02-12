import type { TsonHandlerModel } from 'from-schema';
import { user } from '@lyku/json-models';

export const getUsers = {
	request: {
		type: 'array',
		items: user.properties.id,
	},
	response: {
		type: 'array',
		items: user,
	},
	authenticated: false,
} as const satisfies TsonHandlerModel;
