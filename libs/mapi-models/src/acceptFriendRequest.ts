import type { TsonHandlerModel } from 'from-schema';
import { user } from '@lyku/json-models';

export const acceptFriendRequest = {
	request: user.properties.id,
	authenticated: true,
} as const satisfies TsonHandlerModel;
