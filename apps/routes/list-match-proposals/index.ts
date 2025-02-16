import { handleListMatchProposals } from '@lyku/handles';

export default handleListMatchProposals(
	async ({ game, filter }, { db, requester }) => {
		let query = db.selectFrom('matchProposals');
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
		const users = await db
			.selectFrom('users')
			.where('id', 'in', userIds)
			.selectAll()
			.execute();
		return { proposals, users };
	},
);
