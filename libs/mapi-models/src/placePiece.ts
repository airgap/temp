import { HandlerModel, jsonPrimitives } from 'from-schema';
const { uid } = jsonPrimitives;

export const placePiece = {
	request: {
		type: 'object',
		properties: {
			matchId: uid,
			square: {
				type: 'number',
				minimum: 0,
				maximum: 9,
			},
		},
		required: ['matchId', 'square'],
	},
	response: {
		type: 'object',
		properties: {},
	},
	authenticated: false,
} as const satisfies HandlerModel;
