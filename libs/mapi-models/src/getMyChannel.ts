import { channelName } from '@lyku/json-models';
import { channel } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

export const getMyChannel = {
	request: {
		oneOf: [
			{ type: 'object', properties: { name: channelName } },
			{ type: 'object', properties: { id: channel.properties.id } },
		],
	},
	response: channel,
	authenticated: true,
} as const satisfies TsonHandlerModel;
