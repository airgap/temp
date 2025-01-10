import { MatchProposal } from '@lyku/json-models';
import { AnySecureContext } from '@lyku/route-helpers';

export type Starter = (
	proposal: MatchProposal,
	context: AnySecureContext
) => Promise<bigint>;
