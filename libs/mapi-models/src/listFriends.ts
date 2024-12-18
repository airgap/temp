import { TsonHandlerModel } from 'from-schema';
import { user } from '@lyku/json-models';

export const listFriends = {
	response: {
		type: 'object',
		properties: {
			friends: {
				type: 'array',
				items: user,
			},
		},
		required: ['friends'],
	},
	authenticated: true,
} as const satisfies TsonHandlerModel;
