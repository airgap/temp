import { MatchProposal } from '@lyku/json-models';
import { AnySecureContext, SecureHttpContext } from '@lyku/route-helpers';

export type Starter = (
	proposal: MatchProposal,
	context: AnySecureContext<any>
) => Promise<bigint>;
