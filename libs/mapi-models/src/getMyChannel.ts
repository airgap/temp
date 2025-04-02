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
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
