import { handleProposeMatch } from '@lyku/handles';
import { bondIds } from '@lyku/helpers';
import { MatchProposal } from '@lyku/json-models/index';
import { client as pg } from '@lyku/postgres-client';

export default handleProposeMatch(
	async ({ user: oppId, game }, { requester }) => {
		// Check game and friendship exist
		await Promise.all([
			pg.selectFrom('games').where('id', '=', game).executeTakeFirstOrThrow(),
			pg
				.selectFrom('friendships')
				.where('id', '=', bondIds(requester, oppId))
				.executeTakeFirstOrThrow(),
		]);

		const { id } = await pg
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
	},
);
