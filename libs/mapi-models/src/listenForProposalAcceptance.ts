import type { TsonHandlerModel } from 'from-schema';
import { ttfMatch } from '@lyku/json-models';

export const listenForProposalAcceptance = {
	request: {
		type: 'object',
		properties: {
			id: { type: 'bigint' },
		},
		required: ['id'],
	},
	response: ttfMatch,
	stream: true,
	authenticated: false,
} as const satisfies TsonHandlerModel;
