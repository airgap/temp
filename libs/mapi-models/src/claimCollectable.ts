import { TsonHandlerModel } from 'from-schema';

export const claimCollectable = {
	request: {
		type: 'object',
		properties: {
			id: { type: 'bigint' },
		},
		required: ['id'],
	},
	authenticated: false,
} as const satisfies TsonHandlerModel;
