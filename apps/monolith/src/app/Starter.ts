import { MatchProposal } from '@lyku/json-models';
import { SecureContext } from '@lyku/handles';

export type Starter = (
	proposal: MatchProposal,
	context: SecureContext,
) => Promise<string>;
