import { HandlerModel, jsonPrimitives } from 'from-schema';
import { matchProposalFilter } from '@lyku/json-models';
import { matchProposal } from '@lyku/json-models';
import { user } from '@lyku/json-models';
const { string } = jsonPrimitives;

export const listMatchProposals = {
	request: {
		type: 'object',
		properties: {
			game: string,
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
	authenticated: false,
} as const satisfies HandlerModel;
