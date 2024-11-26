import { HandlerModel, jsonPrimitives } from 'from-schema';
import { game } from '@lyku/json-models';
const { uid, boolean, string } = jsonPrimitives;

export const listGames = {
	request: {
		type: 'object',
		properties: {
			internal: { ...boolean, description: 'Only games made internally' },
			developer: uid,
			hint: string,
			mine: boolean,
			publisher: uid,
		},
		required: [],
	},

	response: {
		type: 'array',
		items: game,
	},
	authenticated: false,
} as const satisfies HandlerModel;
