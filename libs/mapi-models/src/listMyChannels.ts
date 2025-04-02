import type { TsonHandlerModel } from 'from-schema';
import { channel } from '@lyku/json-models';

export const listMyChannels = {
	// request: {},

	response: {
		type: 'array',
		items: channel,
	},
	authenticated: true,
	throws: [400, 401, 500],
} as const satisfies TsonHandlerModel;
