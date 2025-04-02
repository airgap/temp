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
	throws: [400, 500],
} as const satisfies TsonHandlerModel;
