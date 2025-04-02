import type { TsonHandlerModel } from 'from-schema';
import { friendshipStatus, user } from '@lyku/json-models';

export const friendshipStatusFor = {
	request: {
		type: 'object',
		properties: {
			id: user.properties.id,
		},
		required: ['id'],
	},
	response: {
		type: 'object',
		properties: {
			status: friendshipStatus,
		},
		required: ['status'],
	},
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
