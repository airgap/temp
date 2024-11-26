import { channelName } from '@lyku/json-models';
import { channel } from '@lyku/json-models';
import { HandlerModel } from 'from-schema';

export const getMyChannel = {
	request: {
		type: 'object',
		properties: {
			name: channelName,
			id: channel.properties.id,
		},
		required: [],
	},
	response: channel,
	authenticated: true,
} as const satisfies HandlerModel;
