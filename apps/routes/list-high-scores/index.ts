import { handleListHighScores } from '@lyku/handles';
import { Err } from '@lyku/helpers';
import { ElasticLeaderboardService } from '@lyku/route-helpers';
import { client as pg } from '@lyku/postgres-client';

export default handleListHighScores(
	async (
		{
			leaderboard: id,
			sortColumnIndex,
			sortDirection,
			framePoint,
			frameSize,
			includeMyRank,
		},
		{ requester },
	) => {
		console.log(
			'Listing high scores for',
			id,
			'with frameSize:',
			frameSize,
			'framePoint:',
			framePoint,
		);
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

		// Get leaderboard data from Elasticsearch, optionally with user rank
		const startTime = performance.now();
		let elasticResult;
		let userRank = null;

		if (includeMyRank && requester) {
			// Get both leaderboard and user rank in parallel
			const result = await ElasticLeaderboardService.getLeaderboardWithUserRank(
				id,
				requester,
				{
					limit: 20,
					orderDirection,
					columnFormat,
					sortColumnIndex: columnIndex,
					framePoint: framePoint,
					frameSize: frameSize,
				},
			);
			elasticResult = result.leaderboard;
			userRank = result.userRank;
		} else {
			// Just get the leaderboard
			elasticResult = await ElasticLeaderboardService.getLeaderboard(id, {
				limit: 20,
				orderDirection,
				columnFormat,
				sortColumnIndex: columnIndex,
				framePoint: framePoint,
				frameSize: frameSize,
			});
		}
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

		const response: any = {
			scores,
			users,
			leaderboards: [leaderboard as any],
		};

		// Include user rank if requested and available
		if (includeMyRank && userRank) {
			response.myRank = userRank;
		}

		return response;
	},
);
