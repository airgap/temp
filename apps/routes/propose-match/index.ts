import { handleProposeMatch } from '@lyku/handles';
import { bondIds } from '@lyku/helpers';
import { MatchProposal } from '@lyku/json-models/index';

export default handleProposeMatch(
	async ({ user: oppId, game }, { db, requester }) => {
		// Check game and friendship exist
		await Promise.all([
			db.selectFrom('games').where('id', '=', game).executeTakeFirstOrThrow(),
			db
				.selectFrom('friendships')
				.where('id', '=', bondIds(requester, oppId))
				.executeTakeFirstOrThrow(),
		]);

		const { id } = await db
			.insertInto('matchProposals')
			.values({
				created: new Date(),
				from: requester,
				to: oppId,
				game,
			} as MatchProposal)
			.returning('id')
			.executeTakeFirstOrThrow();

		return id;
	}
);
