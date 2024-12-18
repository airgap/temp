import { TsonHandlerModel } from 'from-schema';
import { user } from '@lyku/json-models';

export const amIFollowing = {
	request: user.properties.id,
	response: {
		type: 'boolean',
	},
	authenticated: true,
} as const satisfies TsonHandlerModel;
