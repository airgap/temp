import crypto from 'crypto';
import { Starter } from './Starter';
import { MatchProposal } from '@lyku/json-models';
import { Kysely } from 'kysely';
import { Database } from '@lyku/db-config/kysely';
import { SecureContext } from '@lyku/handles';
export const startTtfMatch: Starter = async (
	proposal: MatchProposal,
	{ db, requester }: SecureContext
) => {
	const amX = Boolean(crypto.randomInt(0, 1));
	const X = amX ? requester : proposal.from;
	const { id } = await db
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
		.executeTakeFirst();
	console.log('Added match', id);
	return id;
};
