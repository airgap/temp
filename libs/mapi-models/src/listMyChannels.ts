import { HandlerModel, jsonPrimitives } from 'from-schema';
import { channel } from '@lyku/json-models';
const { uid } = jsonPrimitives;

export const listMyChannels = {
	// request: {},

	response: {
		type: 'object',
		properties: {
			channels: {
				type: 'array',
				items: channel,
			},
		},
		required: ['channels'],
	},
	authenticated: true,
} as const satisfies HandlerModel;
