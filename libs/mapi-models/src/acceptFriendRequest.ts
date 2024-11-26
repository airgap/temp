import { user } from '@lyku/json-models';
import { b2j, HandlerModel } from 'from-schema';

export const acceptFriendRequest = {
	request: user.properties.id,
	authenticated: true,
} as const satisfies HandlerModel;
