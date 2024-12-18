import { TsonHandlerModel } from 'from-schema';
import { channel } from '@lyku/json-models';

export const listMyChannels = {
	// request: {},

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
	authenticated: true,
} as const satisfies TsonHandlerModel;
