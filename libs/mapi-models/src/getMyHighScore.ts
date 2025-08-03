import type { TsonHandlerModel } from 'from-schema';
import { score } from '@lyku/json-models';

export const getMyHighScore = {
	request: {
		type: 'object',
		properties: {
			game: {
				type: 'bigint',
			},
		},
		required: ['game'],
	},
	response: score,
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
