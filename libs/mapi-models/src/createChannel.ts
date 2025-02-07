import type { TsonHandlerModel } from 'from-schema';
import { channelName, channel } from '@lyku/json-models';

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
