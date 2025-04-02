import type { TsonHandlerModel } from 'from-schema';
import { friendshipStatus, user } from '@lyku/json-models';

export const getFriendshipStatus = {
	request: user.properties.id,
	response: friendshipStatus,
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
