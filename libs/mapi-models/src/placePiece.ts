import type { TsonHandlerModel } from 'from-schema';

export const placePiece = {
	request: {
		type: 'object',
		properties: {
			match: { type: 'bigint' },
			square: {
				type: 'number',
				minimum: 0,
				maximum: 9,
			},
		},
		required: ['match', 'square'],
	},
	authenticated: true,
} as const satisfies TsonHandlerModel;
