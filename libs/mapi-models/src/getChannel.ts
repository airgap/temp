import { channelName } from '@lyku/json-models';
import { channel } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

export const getChannel = {
	request: {
		type: 'object',
		properties: {
			name: channelName,
			id: channel.properties.id,
		},
		required: [],
	},
	response: channel,
	authenticated: false,
} as const satisfies TsonHandlerModel;
