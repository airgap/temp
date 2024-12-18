import { TsonHandlerModel } from 'from-schema';

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
	response: {
		type: 'object',
		properties: {},
	},
	authenticated: false,
} as const satisfies TsonHandlerModel;
