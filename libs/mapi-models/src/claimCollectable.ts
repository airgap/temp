import { HandlerModel, jsonPrimitives } from 'from-schema';

const { uid } = jsonPrimitives;

export const claimCollectable = {
	request: {
		type: 'object',
		properties: {
			id: uid,
		},
		required: ['id'],
	},
	response: {
		type: 'object',
		properties: {},
		required: [],
	},
	authenticated: false,
} as const satisfies HandlerModel;
