import { matchProposal } from '@lyku/json-models';
import { user } from '@lyku/json-models';
import { game } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

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
} as const satisfies TsonHandlerModel;
