import type { TsonHandlerModel } from 'from-schema';
import { matchProposal, ttfMatch } from '@lyku/json-models';

export const acceptMatchProposal = {
	request: matchProposal.properties.id,
	response: ttfMatch.properties.id,
	authenticated: true,
	throws: [400, 401, 404, 409, 500],
} as const satisfies TsonHandlerModel;
