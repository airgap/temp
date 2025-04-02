import type { TsonHandlerModel } from 'from-schema';
import {
	game,
	matchProposalFilter,
	matchProposal,
	user,
} from '@lyku/json-models';

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
	throws: [400, 401, 500],
} as const satisfies TsonHandlerModel;
