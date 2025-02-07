import type { TsonHandlerModel } from 'from-schema';
import { user } from '@lyku/json-models';

export const deleteFriendship = {
	request: user.properties.id,
	authenticated: true,
} as const satisfies TsonHandlerModel;
