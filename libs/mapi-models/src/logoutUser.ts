import type { TsonHandlerModel } from 'from-schema';

export const logoutUser = {
	request: {
		type: 'object',
		properties: {
			everywhere: {
				type: 'boolean',
			},
		},
		required: [],
	},
	authenticated: true,
} as const satisfies TsonHandlerModel;
