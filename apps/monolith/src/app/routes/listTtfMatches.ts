import { monolith } from 'models';
import { useContract } from '../Contract';
import { getUserId } from '../getUserId';
import { row, union } from 'rethinkdb';

export const listTtfMatches = useContract(
	monolith.listTtfMatches,
	async ({ finished }, ctx, { msg }) => {
		const myId = await getUserId(msg, ctx.tables, ctx.connection);
		const q = ctx.tables.ttfMatches;
		const unfiltered = union(
			q.getAll(myId, { index: 'X' }),
			q.getAll(myId, { index: 'O' }),
		);
		const filtered = finished
			? unfiltered.hasFields('winner')
			: unfiltered.filter(row.hasFields('winner').not());
		const matches = await filtered.coerceTo('array').run(ctx.connection);
		const userIds = [
			...new Set(
				matches.map((match) => (match.X === myId ? match.O : match.X)),
			),
		];
		const users = await ctx.tables.users
			.getAll(...userIds)
			.coerceTo('array')
			.run(ctx.connection);
		console.log('users', users);
		return { matches, users };
	},
);
