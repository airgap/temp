import { TsonHandlerModel } from 'from-schema';
import { user } from '@lyku/json-models';

export const listFriends = {
	response: {
		type: 'array',
		items: user,
	},
	authenticated: true,
} as const satisfies TsonHandlerModel;
