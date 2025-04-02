import type { TsonHandlerModel } from 'from-schema';

export const claimCollectable = {
	request: {
		type: 'object',
		properties: {
			id: { type: 'bigint' },
		},
		required: ['id'],
	},
	authenticated: false,
	throws: [400, 401, 404, 409, 500],
} as const satisfies TsonHandlerModel;
