import { btvGameStats, channel } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

export const bounced = {
	request: {
		type: 'object',
		properties: {
			channelId: channel.properties.id,
			corner: {
				type: 'boolean',
			},
			edge: {
				type: 'boolean',
			},
		},
		required: [],
	},
	response: btvGameStats,
	authenticated: true,
} as const satisfies TsonHandlerModel;
