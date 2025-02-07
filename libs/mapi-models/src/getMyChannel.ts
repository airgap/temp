import type { TsonHandlerModel } from 'from-schema';
import { channelName, channel } from '@lyku/json-models';

export const getMyChannel = {
	request: {
		oneOf: [
			{ type: 'object', properties: { name: channelName }, required: ['name'] },
			{
				type: 'object',
				properties: { id: channel.properties.id },
				required: ['id'],
			},
		],
	},
	response: channel,
	authenticated: true,
} as const satisfies TsonHandlerModel;
