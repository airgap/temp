import { HandlerModel } from 'from-schema';
import { matchProposal } from '@lyku/json-models';

export const declineMatchProposal = {
	request: matchProposal.properties.id,
	authenticated: true,
} as const satisfies HandlerModel;
