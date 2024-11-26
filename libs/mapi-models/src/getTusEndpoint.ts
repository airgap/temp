import { HandlerModel } from 'from-schema';

export const getTusEndpoint = {
	response: {
		type: 'object',
		properties: {},
		required: ['post'],
	},
} as const satisfies HandlerModel;
