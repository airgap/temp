import type { TsonHandlerModel } from 'from-schema';

export const getTusEndpoint = {
	response: {
		type: 'string',
	},
	authenticated: false,
	throws: [400, 404, 500],
} as const satisfies TsonHandlerModel;
