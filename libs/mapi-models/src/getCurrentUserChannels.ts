import type { TsonHandlerModel } from 'from-schema';
import { channel } from '@lyku/json-models';

export const getCurrentUserChannels = {
	response: {
		type: 'array',
		items: channel,
	},
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
