import { handleListHighScores } from '@lyku/handles';
import { Err } from '@lyku/helpers';
import { ElasticLeaderboardService } from '@lyku/route-helpers';
import { client as pg } from '@lyku/postgres-client';

export default handleListHighScores(
	async (
		{ leaderboard: id, sortColumnIndex, sortDirection, framePoint, frameSize },
		{ requester },
	) => {
		console.log('Listing high scores for', id);
		const leaderboard = await pg
			.selectFrom('leaderboards')
			.selectAll()
			.where('id', '=', id)
			.executeTakeFirst();
		if (!leaderboard) throw new Err(404);

		// Determine which column to sort by and its format
		const columnIndex = sortColumnIndex ?? 0;
		const columnFormat =
			(leaderboard.columnFormats?.[columnIndex] as
				| 'number'
				| 'text'
				| 'time') || 'number';
		const orderDirection =
			sortDirection ||
			(leaderboard.columnOrders?.[columnIndex] as 'asc' | 'desc') ||
			'desc';

		// Get leaderboard data from Elasticsearch
		const startTime = performance.now();
		const elasticResult = await ElasticLeaderboardService.getLeaderboard(id, {
			limit: 20,
			orderDirection: orderDirection as 'asc' | 'desc',
			columnFormat: columnFormat as 'number' | 'text' | 'time',
			sortColumnIndex: columnIndex,
		});
		const queryTime = performance.now() - startTime;

		// Log slow queries for monitoring
		if (queryTime > 1000) {
			console.warn(
				`Slow Elasticsearch leaderboard query: ${queryTime}ms for leaderboard ${id} (column ${columnIndex})`,
			);
		}

		// Convert Elasticsearch results to expected format
		const scores = elasticResult.scores.map((result, index) => ({
			id: BigInt(index + 1), // Temporary ID for compatibility
			user: result.user,
			leaderboard: id,
			columns: result.columns,
			created: new Date(result.created),
			updated: new Date(result.created),
			reports: 0,
			game: Number(leaderboard.game || 1),
			verifiers: [] as bigint[],
		}));

		// Get user data for the scores
		const userIds = scores.map((s) => s.user);
		const users =
			userIds.length > 0
				? await pg
						.selectFrom('users')
						.selectAll()
						.where('id', 'in', userIds)
						.execute()
				: [];

		return {
			scores,
			users,
			leaderboards: [leaderboard as any],
		};
	},
);
