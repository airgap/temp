import type { TsonHandlerModel } from 'from-schema';
import { user } from '@lyku/json-models';

export const amIFollowing = {
	request: user.properties.id,
	response: {
		type: 'boolean',
	},
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
