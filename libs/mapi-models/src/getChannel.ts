import type { TsonHandlerModel } from 'from-schema';
import { channelName, channel } from '@lyku/json-models';

export const getChannel = {
	request: {
		oneOf: [
			{
				type: 'object',
				properties: {
					name: channelName,
				},
				required: ['name'],
			},
			{
				type: 'object',
				properties: {
					id: channel.properties.id,
				},
				required: ['id'],
			},
		],
	},
	response: channel,
	authenticated: false,
} as const satisfies TsonHandlerModel;
