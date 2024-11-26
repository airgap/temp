import { HandlerModel } from 'from-schema';
import { matchProposal } from '@lyku/json-models';
import { ttfMatch } from '@lyku/json-models';

export const acceptMatchProposal = {
	request: matchProposal.properties.id,
	response: ttfMatch.properties.id,
	authenticated: true,
} as const satisfies HandlerModel;
