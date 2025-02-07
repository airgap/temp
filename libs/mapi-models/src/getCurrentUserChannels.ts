import type { TsonHandlerModel } from 'from-schema';
import { channel } from '@lyku/json-models';

export const getCurrentUserChannels = {
	response: {
		type: 'array',
		items: channel,
	},
	authenticated: true,
} as const satisfies TsonHandlerModel;
