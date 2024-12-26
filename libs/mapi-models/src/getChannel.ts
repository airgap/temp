import { channelName } from '@lyku/json-models';
import { channel } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

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
