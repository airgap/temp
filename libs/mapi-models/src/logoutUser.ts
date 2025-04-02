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
	throws: [400, 401, 500],
} as const satisfies TsonHandlerModel;
