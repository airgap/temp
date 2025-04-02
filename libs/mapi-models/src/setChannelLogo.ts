import { channel } from '@lyku/json-models';
import type { TsonHandlerModel } from 'from-schema';

export const setChannelLogo = {
	request: {
		type: 'object',
		properties: {
			data: { type: 'string' },
			channel: { type: 'bigint' },
		},
		required: ['data', 'channel'],
	},
	response: {
		type: 'object',
		properties: {
			channel,
		},
		required: ['channel'],
	},
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
