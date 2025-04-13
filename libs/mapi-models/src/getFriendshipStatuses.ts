import type { TsonHandlerModel } from 'from-schema';
import { friendshipStatus, user } from '@lyku/json-models';

export const getFriendshipStatuses = {
	request: { type: 'array', items: user.properties.id },
	response: { type: 'array', items: friendshipStatus },
	authenticated: true,
	throws: [400, 401, 500],
} as const satisfies TsonHandlerModel;
