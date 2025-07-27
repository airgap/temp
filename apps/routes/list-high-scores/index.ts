import { handleListHighScores } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
import { sql } from 'kysely';

export default handleListHighScores(
	async ({ leaderboard: id, channel }, { requester }) => {
		const leaderboard = await pg
			.selectFrom('leaderboards')
			.selectAll()
			.where('id', '=', id)
			.executeTakeFirstOrThrow();

		// Get the first column's format and order direction
		const columnFormat = leaderboard.columnFormats?.[0] || 'text';
		const orderDirection = leaderboard.columnOrders?.[0] || 'desc';

		// Build the ORDER BY expression based on data format
		let orderByExpression;
		switch (columnFormat) {
			case 'number':
			case 'bigint':
				orderByExpression = sql`(columns[1])::numeric`;
				break;
			case 'time':
				orderByExpression = sql`(columns[1])::interval`;
				break;
			case 'text':
			default:
				orderByExpression = sql`columns[1]`;
				break;
		}

		let q = pg
			.selectFrom('scores')
			.selectAll()
			.where('leaderboard', '=', id)
			.orderBy(orderByExpression, orderDirection === 'asc' ? 'asc' : 'desc');

		if (channel) q = q.where('channel', '=', channel);
		const messages = await q.orderBy('created', 'desc').limit(20).execute();
		return { messages };
	},
);
