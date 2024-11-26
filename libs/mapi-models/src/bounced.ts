import { HandlerModel, jsonPrimitives } from 'from-schema';

const { uid } = jsonPrimitives;

export const bounced = {
	request: {
		type: 'object',
		properties: {
			channelId: uid,
			corner: {
				type: 'boolean',
			},
			edge: {
				type: 'boolean',
			},
		},
		required: [],
	},
	response: {
		type: 'object',
		properties: {},
		required: ['current', 'total'],
	},
	authenticated: true,
} as const satisfies HandlerModel;
