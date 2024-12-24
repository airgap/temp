import { FromObjectSchema, FromSchema } from 'from-schema';
import { useContract } from '../Contract';
import { getUserId } from '../getUserId';
import { matchProposal, monolith } from 'models';
import { FilterPredicate, union } from 'rethinkdb';

export const listMatchProposals = useContract(
	monolith.listMatchProposals,
	async ({ game, filter }, ctx, { msg }) => {
		const myId = await getUserId(msg, ctx.tables, ctx.connection);
		const filters: FilterPredicate<FromSchema<typeof matchProposal>>[] = [];
		if (game) filters.push({ game });
		const q = ctx.tables.matchProposals;
		const query =
			filter === 'received'
				? q.getAll(myId, { index: 'to' })
				: filter === 'sent'
				? q.getAll(myId, { index: 'from' })
				: union<FromObjectSchema<typeof matchProposal>>(
						q.getAll(myId, { index: 'from' }),
						q.getAll(myId, { index: 'to' })
				  );
		const proposals = await query.coerceTo('array').run(ctx.connection);
		const userIds = [
			...new Set(
				proposals.map((proposal) =>
					proposal.to === myId ? proposal.from : proposal.to
				)
			),
		];
		const users = await ctx.tables.users
			.getAll(...userIds)
			.coerceTo('array')
			.run(ctx.connection);
		return { proposals, users };
	}
);
