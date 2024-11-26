import { HandlerModel, jsonPrimitives } from 'from-schema';
import { user } from '@lyku/json-models';
const { uid } = jsonPrimitives;

export const listMyBots = {
	response: {
		type: 'array',
		items: user,
	},
	authenticated: true,
} as const satisfies HandlerModel;
