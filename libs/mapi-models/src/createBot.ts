import { TsonHandlerModel } from 'from-schema';
import { username } from '@lyku/json-models';
import { user } from '@lyku/json-models';

export const createBot = {
	request: {
		type: 'object',
		properties: {
			username,
		},
		required: ['username'],
	},
	response: user.properties.id,
	authenticated: true,
} as const satisfies TsonHandlerModel;
