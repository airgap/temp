import { user } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

export const acceptFriendRequest = {
	request: user.properties.id,
	authenticated: true,
} as const satisfies TsonHandlerModel;
