import { HandlerModel } from 'from-schema';
import { channel } from '@lyku/json-models';

export const getCurrentUserChannels = {
	request: {
		type: 'object',
		properties: {},
		required: [],
	},
	response: {
		type: 'object',
		properties: {
			channels: {
				type: 'array',
				items: channel,
			},
			error: {
				type: 'string',
			},
		},
		required: [],
	},
	authenticated: true,
} as const satisfies HandlerModel;
