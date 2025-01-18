import { TsonHandlerModel } from 'from-schema';
import { game, matchProposalFilter } from '@lyku/json-models';
import { matchProposal } from '@lyku/json-models';
import { user } from '@lyku/json-models';

export const listMatchProposals = {
	request: {
		type: 'object',
		properties: {
			game: game.properties.id,
			filter: matchProposalFilter,
		},
		required: [],
	},

	response: {
		type: 'object',
		properties: {
			proposals: {
				type: 'array',
				items: matchProposal,
			},
			users: {
				type: 'array',
				items: user,
			},
		},
		required: ['proposals', 'users'],
	},
	authenticated: true,
} as const satisfies TsonHandlerModel;
