import { handleProposeMatch } from '@lyku/handles';
import { bondIds } from '@lyku/helpers';

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

		const [{ id: proposalId }] = await db
			.insertInto('matchProposals')
			.values({
				created: new Date(),
				from: requester,
				to: oppId,
				game,
			})
			.returning('id')
			.execute();

		return { proposalId };
	}
);
