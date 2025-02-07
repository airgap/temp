import type { TsonHandlerModel } from 'from-schema';
import { channel } from '@lyku/json-models';

export const listMyChannels = {
	// request: {},

	response: {
		type: 'array',
		items: channel,
	},
	authenticated: true,
} as const satisfies TsonHandlerModel;
