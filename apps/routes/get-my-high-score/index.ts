import { handleGetMyHighScore } from '@lyku/handles';
import { Err } from '@lyku/helpers';
import { client as elasticsearch } from '@lyku/elasticsearch-client';
import { client as pg } from '@lyku/postgres-client';
import type { Score } from '@lyku/json-models';

export default handleGetMyHighScore(async ({ game }, { requester }) => {
	console.log('Getting high score for user', requester, 'in game', game);

	// First, get the default leaderboard configuration for this game
	// We'll use the first leaderboard as the default scoring system
	const defaultLeaderboard = await pg
		.selectFrom('leaderboards')
		.selectAll()
		.where('game', '=', game)
		.orderBy('created', 'asc')
		.limit(1)
		.executeTakeFirst();

	if (!defaultLeaderboard) {
		throw new Err(404, 'No leaderboards found for this game');
	}

	// Determine the sort column and format from the leaderboard configuration
	const columnIndex = 0; // Default to first column for score
	const columnFormat =
		(defaultLeaderboard.columnFormats?.[columnIndex] as
			| 'number'
			| 'text'
			| 'time') || 'number';
	const orderDirection =
		(defaultLeaderboard.columnOrders?.[columnIndex] as 'asc' | 'desc') ||
		'desc';

	// Use Elasticsearch to get the user's best score across all leaderboards for this game
	const sortField =
		columnFormat === 'number' ? 'score' : 'first_column.keyword';

	const response = await elasticsearch.search({
		index: 'scores-*',
		body: {
			size: 0,
			query: {
				bool: {
					filter: [
						{ term: { user: requester.toString() } },
						{ term: { game: Number(game) } },
					],
					must_not: [{ exists: { field: 'deleted' } }],
				},
			},
			aggs: {
				best_score: {
					top_hits: {
						size: 1,
						sort: [{ [sortField]: { order: orderDirection } }],
						_source: [
							'id',
							'user',
							'channel',
							'score',
							'created',
							'columns',
							'updated',
							'game',
							'deleted',
							'reports',
							'leaderboard',
							'verified',
							'verifiers',
							'stream',
							'first_column',
						],
					},
				},
			},
		},
	});

	const bestScoreHit = response.body.aggregations?.best_score?.hits?.hits?.[0];

	if (!bestScoreHit || !bestScoreHit._source) {
		throw new Err(404, 'No high score found for this game');
	}

	const source = bestScoreHit._source;

	// Convert the Elasticsearch document to the Score type
	const score: Score = {
		id: BigInt(source.id),
		user: BigInt(source.user),
		channel: source.channel ? BigInt(source.channel) : undefined,
		reports: Number(source.reports || 0),
		columns: source.columns || [],
		leaderboard: BigInt(source.leaderboard),
		game: Number(source.game),
		created: new Date(source.created),
		updated: new Date(source.updated),
		deleted: source.deleted ? new Date(source.deleted) : undefined,
		verified: source.verified ? new Date(source.verified) : undefined,
		verifiers: source.verifiers
			? source.verifiers.map((v: string) => BigInt(v))
			: undefined,
		stream: source.stream,
	};

	return score;
});
