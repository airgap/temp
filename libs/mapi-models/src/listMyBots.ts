import type { TsonHandlerModel } from 'from-schema';
import { user } from '@lyku/json-models';

export const listMyBots = {
	response: {
		type: 'array',
		items: user,
	},
	authenticated: true,
	throws: [400, 401, 500],
} as const satisfies TsonHandlerModel;
