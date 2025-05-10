import { handleListMatchProposals } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleListMatchProposals(
	async ({ game, filter }, { requester }) => {
		let query = pg.selectFrom('matchProposals');
		if (game) query = query.where('game', '=', game);
		query =
			filter === 'received'
				? query.where('to', '=', requester)
				: filter === 'sent'
					? query.where('from', '=', requester)
					: query.where('to', '=', requester).where('from', '=', requester);
		const proposals = await query.selectAll().execute();
		const userIds = [
			...new Set(
				proposals.map((proposal) =>
					proposal.to === requester ? proposal.from : proposal.to,
				),
			),
		];
		const users = await pg
			.selectFrom('users')
			.where('id', 'in', userIds)
			.selectAll()
			.execute();
		return { proposals, users };
	},
);
