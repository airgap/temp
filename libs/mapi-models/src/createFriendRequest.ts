import type { TsonHandlerModel } from 'from-schema';
import { idBond, user } from '@lyku/json-models';

export const createFriendRequest = {
	request: user.properties.id,
	response: {
		type: 'object',
		properties: {
			id: idBond,
		},
		required: ['id'],
	},
	authenticated: true,
	throws: [400, 401, 404, 409, 500],
} as const satisfies TsonHandlerModel;
