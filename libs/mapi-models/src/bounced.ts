import { channel } from '@lyku/json-models';
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
	response: {
		type: 'object',
		properties: {
			current: {
				type: 'number',
			},
			total: {
				type: 'number',
			},
		},
		required: ['current', 'total'],
	},
	authenticated: true,
} as const satisfies TsonHandlerModel;
