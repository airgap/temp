import { channelName } from '@lyku/json-models';
import { channel } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

export const createChannel = {
	request: {
		type: 'object',
		properties: {
			name: channelName,
		},
		required: ['name'],
	},
	response: {
		type: 'object',
		properties: {
			channel,
		},
		required: ['channel'],
	},
	authenticated: true,
} as const satisfies TsonHandlerModel;
