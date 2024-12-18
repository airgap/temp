import { now } from 'rethinkdb';
import crypto from 'crypto';
import { HardenedState } from './types/State';
import { Starter } from './Starter';
import { FromBsonSchema } from 'from-schema';
import { matchProposal } from 'models';

export const startTtfMatch: Starter = async (
	myId: string,
	proposal: FromBsonSchema<typeof matchProposal>,
	context: HardenedState,
) => {
	const amX = Boolean(crypto.randomInt(0, 1));
	const X = amX ? myId : proposal.from;
	const matchId = await context.tables.ttfMatches
		.insert({
			X,
			O: amX ? proposal.from : myId,
			board: '---------',
			turn: 1,
			created: now(),
			whoseTurn: X,
		})('generated_keys')(0)
		.run(context.connection);
	console.log('Added match', matchId);
	return matchId;
};
