import { TsonHandlerModel } from 'from-schema';
import { idBond } from '@lyku/json-models';
import { user } from '@lyku/json-models';

export const createFriendRequest = {
	request: user.properties.id,
	response: {
		type: 'object',
		properties: {
			id: idBond,
		},
		required: ['id'],
	},
	authenticated: true,
} as const satisfies TsonHandlerModel;
