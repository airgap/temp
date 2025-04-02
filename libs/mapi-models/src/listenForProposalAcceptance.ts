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
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
