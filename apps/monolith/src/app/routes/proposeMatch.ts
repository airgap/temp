import { monolith } from 'models';
import { now, and } from 'rethinkdb';

import { useContract } from '../Contract';
import { bondIds } from 'helpers';

export const proposeMatch = useContract(
	monolith.proposeMatch,
	async ({ user: oppId, game }, { tables, connection }, { userId }) => {
		await and(
			tables.games.get(game),
			tables.friendships.get(bondIds(userId, oppId)),
		).run(connection);
		const proposalId = await tables.matchProposals
			.insert({
				created: now(),
				from: userId,
				to: oppId,
				game,
			})('generated_keys')(0)
			.run(connection);
		return { proposalId };
	},
);
