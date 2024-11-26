import { HandlerModel } from 'from-schema';
import { channel } from '@lyku/json-models';

export const getUserChannels = {
	request: {
		type: 'object',
		properties: {
			user: channel.properties.id,
		},
		required: ['userId'],
	},
	response: {
		type: 'object',
		properties: {
			channels: {
				type: 'array',
				items: channel,
			},
		},
		required: ['channels'],
	},
	authenticated: false,
} as const satisfies HandlerModel;
