import type { TsonHandlerModel } from 'from-schema';
import { matchProposal } from '@lyku/json-models';

export const declineMatchProposal = {
	request: matchProposal.properties.id,
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
