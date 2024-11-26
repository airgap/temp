import { matchProposal } from '@lyku/json-models';
import { user } from '@lyku/json-models';
import { game } from '@lyku/json-models';
import { HandlerModel } from 'from-schema';

export const proposeMatch = {
	request: {
		type: 'object',
		properties: {
			user: user.properties.id,
			game: game.properties.id,
		},
		required: ['user', 'game'],
	},
	response: {
		type: 'object',
		properties: {
			proposalId: matchProposal.properties.id,
		},
		required: ['proposalId'],
	},
	authenticated: true,
} as const satisfies HandlerModel;
