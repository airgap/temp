import crypto from 'crypto';
import { Starter } from './Starter';
import { MatchProposal } from '@lyku/json-models';
import { AnySecureContext } from '@lyku/route-helpers';
export const startTtfMatch: Starter = async (
	proposal: MatchProposal,
	{ db, requester }: AnySecureContext<any>,
) => {
	const amX = Boolean(crypto.randomInt(0, 1));
	const X = amX ? requester : proposal.from;
	const result = await db
		.insertInto('ttfMatches')
		.values({
			X,
			O: amX ? proposal.from : requester,
			board: '---------',
			turn: 1,
			created: new Date(),
			whoseTurn: X,
		})
		.returning('id')
		.executeTakeFirstOrThrow();
	const id = result.id;
	console.log('Added match', id);
	return id;
};
