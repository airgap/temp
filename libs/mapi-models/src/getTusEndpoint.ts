import { TsonHandlerModel } from 'from-schema';

export const getTusEndpoint = {
	response: {
		type: 'string',
	},
} as const satisfies TsonHandlerModel;
