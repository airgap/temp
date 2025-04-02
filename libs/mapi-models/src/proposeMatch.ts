import { matchProposal } from '@lyku/json-models';
import { user } from '@lyku/json-models';
import { game } from '@lyku/json-models';
import type { TsonHandlerModel } from 'from-schema';

export const proposeMatch = {
	request: {
		type: 'object',
		properties: {
			user: user.properties.id,
			game: game.properties.id,
		},
		required: ['user', 'game'],
	},
	response: matchProposal.properties.id,

	authenticated: true,
	throws: [400, 401, 404, 409, 500],
} as const satisfies TsonHandlerModel;
