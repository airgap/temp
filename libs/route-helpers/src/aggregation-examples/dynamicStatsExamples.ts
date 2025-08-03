import {
	ElasticLeaderboardService,
	StatColumn,
} from '../elasticLeaderboardService';

/**
 * Dynamic Stats Examples
 *
 * This file demonstrates how to use dynamic/abstract stat columns in Elasticsearch
 * for games with different statistics structures.
 */

/**
 * Example Game Configurations
 * Each game can define its own stat schema
 */
export const GAME_SCHEMAS: Record<number, StatColumn[]> = {
	// Game 1: Mario Speedrun
	1: [
		{
			name: 'time',
			type: 'time',
			unit: 'seconds',
			description: 'Completion time',
			aggregatable: true,
			sortable: true,
		},
		{
			name: 'deaths',
			type: 'number',
			unit: 'count',
			description: 'Number of deaths',
			aggregatable: true,
			sortable: true,
		},
		{
			name: 'power_ups',
			type: 'number',
			unit: 'count',
			description: 'Power-ups collected',
			aggregatable: true,
			sortable: true,
		},
		{
			name: 'route',
			type: 'string',
			description: 'Route taken',
			aggregatable: false,
			sortable: false,
		},
		{
			name: 'glitchless',
			type: 'boolean',
			description: 'No glitches used',
			aggregatable: false,
			sortable: false,
		},
	],

	// Game 2: Puzzle Game
	2: [
		{
			name: 'score',
			type: 'number',
			unit: 'points',
			description: 'Final score',
			aggregatable: true,
			sortable: true,
		},
		{
			name: 'moves',
			type: 'number',
			unit: 'count',
			description: 'Number of moves',
			aggregatable: true,
			sortable: true,
		},
		{
			name: 'time_bonus',
			type: 'number',
			unit: 'points',
			description: 'Time bonus points',
			aggregatable: true,
			sortable: true,
		},
		{
			name: 'difficulty',
			type: 'string',
			description: 'Difficulty level',
			aggregatable: false,
			sortable: true,
		},
		{
			name: 'perfect_clear',
			type: 'boolean',
			description: 'Achieved perfect clear',
			aggregatable: false,
			sortable: false,
		},
	],

	// Game 3: Racing Game
	3: [
		{
			name: 'lap_time',
			type: 'time',
			unit: 'seconds',
			description: 'Best lap time',
			aggregatable: true,
			sortable: true,
		},
		{
			name: 'total_time',
			type: 'time',
			unit: 'seconds',
			description: 'Total race time',
			aggregatable: true,
			sortable: true,
		},
		{
			name: 'top_speed',
			type: 'number',
			unit: 'mph',
			description: 'Top speed reached',
			aggregatable: true,
			sortable: true,
		},
		{
			name: 'crashes',
			type: 'number',
			unit: 'count',
			description: 'Number of crashes',
			aggregatable: true,
			sortable: true,
		},
		{
			name: 'vehicle',
			type: 'string',
			description: 'Vehicle used',
			aggregatable: false,
			sortable: false,
		},
		{
			name: 'weather',
			type: 'string',
			description: 'Weather conditions',
			aggregatable: false,
			sortable: false,
		},
	],

	// Game 4: Fighting Game
	4: [
		{
			name: 'wins',
			type: 'number',
			unit: 'count',
			description: 'Number of wins',
			aggregatable: true,
			sortable: true,
		},
		{
			name: 'losses',
			type: 'number',
			unit: 'count',
			description: 'Number of losses',
			aggregatable: true,
			sortable: true,
		},
		{
			name: 'combo_max',
			type: 'number',
			unit: 'hits',
			description: 'Maximum combo',
			aggregatable: true,
			sortable: true,
		},
		{
			name: 'damage_dealt',
			type: 'number',
			unit: 'points',
			description: 'Total damage dealt',
			aggregatable: true,
			sortable: true,
		},
		{
			name: 'character',
			type: 'string',
			description: 'Character used',
			aggregatable: false,
			sortable: false,
		},
		{
			name: 'perfect_round',
			type: 'boolean',
			description: 'Achieved perfect round',
			aggregatable: false,
			sortable: false,
		},
	],
};

/**
 * Sample Data Creation
 */
export class DynamicStatsExamples {
	/**
	 * Create sample scores with different stat structures per game
	 */
	static createSampleScores(): Array<{
		id: bigint;
		user: bigint;
		leaderboard: bigint;
		game: number;
		columns: string[];
		created: Date;
		updated: Date;
		reports: number;
	}> {
		return [
			// Mario Speedrun scores
			{
				id: BigInt(1),
				user: BigInt(100),
				leaderboard: BigInt(1),
				game: 1,
				columns: ['4:23.45', '3', '12', 'cloud_route', 'true'],
				created: new Date(),
				updated: new Date(),
				reports: 0,
			},
			{
				id: BigInt(2),
				user: BigInt(101),
				leaderboard: BigInt(1),
				game: 1,
				columns: ['4:45.12', '7', '8', 'castle_route', 'false'],
				created: new Date(),
				updated: new Date(),
				reports: 0,
			},

			// Puzzle Game scores
			{
				id: BigInt(3),
				user: BigInt(102),
				leaderboard: BigInt(2),
				game: 2,
				columns: ['95000', '45', '5000', 'hard', 'true'],
				created: new Date(),
				updated: new Date(),
				reports: 0,
			},
			{
				id: BigInt(4),
				user: BigInt(103),
				leaderboard: BigInt(2),
				game: 2,
				columns: ['87500', '52', '3200', 'medium', 'false'],
				created: new Date(),
				updated: new Date(),
				reports: 0,
			},

			// Racing Game scores
			{
				id: BigInt(5),
				user: BigInt(104),
				leaderboard: BigInt(3),
				game: 3,
				columns: ['1:32.45', '5:23.12', '185', '2', 'ferrari', 'sunny'],
				created: new Date(),
				updated: new Date(),
				reports: 0,
			},

			// Fighting Game scores
			{
				id: BigInt(6),
				user: BigInt(105),
				leaderboard: BigInt(4),
				game: 4,
				columns: ['15', '3', '23', '2450', 'ryu', 'true'],
				created: new Date(),
				updated: new Date(),
				reports: 0,
			},
		];
	}

	/**
	 * Example 1: Basic Stats Aggregation
	 * Get average completion time for Mario speedruns
	 */
	static async getAverageCompletionTime(): Promise<number> {
		const result = await ElasticLeaderboardService.aggregateOnStats(
			[BigInt(1)], // Mario speedrun leaderboard
			'time', // stat name
			'avg', // aggregation type
		);

		console.log(`Average Mario completion time: ${result.aggregation} seconds`);
		return result.aggregation || 0;
	}

	/**
	 * Example 2: Grouped Aggregation
	 * Get average score by difficulty level in puzzle game
	 */
	static async getScoresByDifficulty(): Promise<
		Array<{ difficulty: string; averageScore: number }>
	> {
		const result = await ElasticLeaderboardService.aggregateOnStats(
			[BigInt(2)], // Puzzle game leaderboard
			'score', // stat to aggregate
			'avg', // aggregation type
			{
				groupBy: 'difficulty', // group by difficulty level
			},
		);

		if (result.buckets) {
			const scores = result.buckets.map((bucket) => ({
				difficulty: bucket.key,
				averageScore: bucket.value,
			}));

			console.log('Average scores by difficulty:', scores);
			return scores;
		}

		return [];
	}

	/**
	 * Example 3: Multi-Stat Analysis
	 * Analyze relationship between deaths and completion time
	 */
	static async analyzeDeathsVsTime(): Promise<{
		lowDeaths: { avgTime: number; count: number };
		highDeaths: { avgTime: number; count: number };
	}> {
		// Get stats for runs with low deaths (0-5)
		const lowDeathsResult = await ElasticLeaderboardService.aggregateOnStats(
			[BigInt(1)],
			'time',
			'avg',
			{
				filters: { deaths: { lte: 5 } },
			},
		);

		// Get stats for runs with high deaths (6+)
		const highDeathsResult = await ElasticLeaderboardService.aggregateOnStats(
			[BigInt(1)],
			'time',
			'avg',
			{
				filters: { deaths: { gte: 6 } },
			},
		);

		return {
			lowDeaths: { avgTime: lowDeathsResult.aggregation || 0, count: 0 },
			highDeaths: { avgTime: highDeathsResult.aggregation || 0, count: 0 },
		};
	}

	/**
	 * Example 4: Time-Based Stats Analysis
	 * Get performance trends over time
	 */
	static async getPerformanceTrends(
		leaderboardId: bigint,
		statName: string,
		timeRange: { start: Date; end: Date },
	): Promise<any> {
		return ElasticLeaderboardService.aggregateOnStats(
			[leaderboardId],
			statName,
			'avg',
			{
				timeRange,
				groupBy: 'month', // Would need to be implemented as a date histogram
			},
		);
	}

	/**
	 * Example 5: Cross-Game Character/Vehicle Analysis
	 */
	static async getCharacterPerformance(): Promise<
		Array<{
			character: string;
			avgWins: number;
			maxCombo: number;
			totalPlayers: number;
		}>
	> {
		// Get win rates by character
		const winResult = await ElasticLeaderboardService.aggregateOnStats(
			[BigInt(4)], // Fighting game
			'wins',
			'avg',
			{ groupBy: 'character' },
		);

		// Get max combo by character
		const comboResult = await ElasticLeaderboardService.aggregateOnStats(
			[BigInt(4)],
			'combo_max',
			'max',
			{ groupBy: 'character' },
		);

		// Combine results (simplified - in practice you'd do this in a single query)
		const characters: Array<any> = [];

		if (winResult.buckets && comboResult.buckets) {
			winResult.buckets.forEach((winBucket) => {
				const comboBucket = comboResult.buckets?.find(
					(cb) => cb.key === winBucket.key,
				);
				characters.push({
					character: winBucket.key,
					avgWins: winBucket.value,
					maxCombo: comboBucket?.value || 0,
					totalPlayers: winBucket.doc_count,
				});
			});
		}

		return characters;
	}

	/**
	 * Example 6: Dynamic Leaderboard Creation
	 * Create leaderboards based on any stat column
	 */
	static async createDynamicLeaderboard(
		gameId: number,
		statName: string,
		sortDirection: 'asc' | 'desc' = 'desc',
		limit: number = 50,
	): Promise<
		Array<{
			user: bigint;
			value: any;
			rank: number;
		}>
	> {
		// This would require a more complex query to sort by dynamic stats
		// For now, return a placeholder structure
		const results: Array<any> = [];

		console.log(
			`Creating dynamic leaderboard for game ${gameId}, stat: ${statName}`,
		);

		// Implementation would use script-based sorting or aggregations
		// to create rankings based on the specified stat

		return results;
	}

	/**
	 * Example 7: Advanced Multi-Stat Filtering
	 * Find players who meet multiple criteria across different stats
	 */
	static async findTopRoundedPlayers(): Promise<
		Array<{
			user: bigint;
			stats: Record<string, any>;
		}>
	> {
		// Find Mario speedrunners who:
		// - Completed in under 5 minutes
		// - Had fewer than 5 deaths
		// - Used glitchless route
		// - Collected more than 10 power-ups

		const filters = {
			time: { lt: 300 }, // Under 5 minutes (300 seconds)
			deaths: { lt: 5 }, // Fewer than 5 deaths
			glitchless: true, // Glitchless run
			power_ups: { gte: 10 }, // 10+ power-ups
		};

		// This would require a complex bool query with multiple filters
		console.log('Finding well-rounded players with filters:', filters);

		return [];
	}

	/**
	 * Example 8: Stat Discovery and Schema Analysis
	 */
	static async analyzeGameStats(gameId: number): Promise<{
		totalStats: number;
		numericStats: string[];
		categoricalStats: string[];
		timeStats: string[];
		sampleData: Record<string, any[]>;
	}> {
		const statsInfo = await ElasticLeaderboardService.getAvailableStats(gameId);

		const numericStats = statsInfo.stats
			.filter((s) => s.type === 'number')
			.map((s) => s.name);
		const categoricalStats = statsInfo.stats
			.filter((s) => s.type === 'string')
			.map((s) => s.name);
		const timeStats = statsInfo.stats
			.filter((s) => s.type === 'time')
			.map((s) => s.name);

		const sampleData: Record<string, any[]> = {};
		statsInfo.stats.forEach((stat) => {
			sampleData[stat.name] = stat.sampleValues;
		});

		return {
			totalStats: statsInfo.stats.length,
			numericStats,
			categoricalStats,
			timeStats,
			sampleData,
		};
	}

	/**
	 * Example 9: Custom Composite Scoring
	 * Create complex scores based on multiple stats
	 */
	static async calculateCompositeScores(
		leaderboardId: bigint,
		weights: Record<string, number>,
	): Promise<
		Array<{
			user: bigint;
			compositeScore: number;
			breakdown: Record<string, number>;
		}>
	> {
		// Example: Mario speedrun composite score
		// Formula: (1000 / time) + (power_ups * 10) - (deaths * 5)
		// This would require script-based aggregations or post-processing

		console.log(`Calculating composite scores with weights:`, weights);

		// Placeholder implementation
		return [];
	}

	/**
	 * Example 10: Real-time Stats Monitoring
	 * Monitor stats as they come in for anomaly detection
	 */
	static async monitorStatsAnomalies(
		gameId: number,
		statName: string,
		threshold: number,
	): Promise<{
		anomalies: Array<{
			user: bigint;
			value: number;
			expectedRange: { min: number; max: number };
			timestamp: Date;
		}>;
	}> {
		// Get recent stats for comparison
		const recentStats = await ElasticLeaderboardService.aggregateOnStats(
			[], // All leaderboards for this game
			statName,
			'percentiles',
			{
				timeRange: {
					start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
					end: new Date(),
				},
			},
		);

		console.log(
			`Monitoring ${statName} for anomalies above ${threshold}x normal`,
		);

		// Implementation would compare new values against historical percentiles
		return { anomalies: [] };
	}
}

/**
 * Usage Examples and Test Runner
 */
export class StatsUsageRunner {
	static async runAllExamples(): Promise<void> {
		console.log('=== Dynamic Stats Examples ===\n');

		try {
			// Example 1: Basic aggregation
			console.log('1. Average completion time:');
			await DynamicStatsExamples.getAverageCompletionTime();

			// Example 2: Grouped aggregation
			console.log('\n2. Scores by difficulty:');
			await DynamicStatsExamples.getScoresByDifficulty();

			// Example 3: Multi-stat analysis
			console.log('\n3. Deaths vs Time analysis:');
			const deathAnalysis = await DynamicStatsExamples.analyzeDeathsVsTime();
			console.log(deathAnalysis);

			// Example 4: Character performance
			console.log('\n4. Character performance:');
			const charPerf = await DynamicStatsExamples.getCharacterPerformance();
			console.log(charPerf);

			// Example 5: Game stats analysis
			console.log('\n5. Game stats analysis:');
			const gameAnalysis = await DynamicStatsExamples.analyzeGameStats(1);
			console.log(gameAnalysis);
		} catch (error) {
			console.error('Error running examples:', error);
		}
	}

	/**
	 * Setup sample data for testing
	 */
	static async setupSampleData(): Promise<void> {
		console.log('Setting up sample data...');

		const sampleScores = DynamicStatsExamples.createSampleScores();

		// Convert to Score format and bulk index
		const scores = sampleScores.map((score) => ({
			id: score.id,
			user: score.user,
			leaderboard: score.leaderboard,
			columns: score.columns,
			created: score.created,
			updated: score.updated,
			game: score.game,
			reports: score.reports,
		}));

		await ElasticLeaderboardService.bulkIndexScores(scores as any);
		console.log(`Indexed ${scores.length} sample scores`);
	}
}

/**
 * Advanced Query Builder for Dynamic Stats
 */
export class DynamicStatsQueryBuilder {
	private filters: Array<any> = [];
	private aggregations: Record<string, any> = {};
	private gameIds: number[] = [];
	private leaderboardIds: bigint[] = [];

	constructor() {}

	/**
	 * Add game filter
	 */
	filterByGames(gameIds: number[]): this {
		this.gameIds = gameIds;
		return this;
	}

	/**
	 * Add leaderboard filter
	 */
	filterByLeaderboards(leaderboardIds: bigint[]): this {
		this.leaderboardIds = leaderboardIds;
		return this;
	}

	/**
	 * Add stat-based filter
	 */
	filterByStat(
		statName: string,
		operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'range',
		value: any,
		upperValue?: any,
	): this {
		let filter: any;

		switch (operator) {
			case 'eq':
				filter = { term: { [`stats.${statName}`]: value } };
				break;
			case 'gt':
				filter = { range: { [`stats.${statName}`]: { gt: value } } };
				break;
			case 'gte':
				filter = { range: { [`stats.${statName}`]: { gte: value } } };
				break;
			case 'lt':
				filter = { range: { [`stats.${statName}`]: { lt: value } } };
				break;
			case 'lte':
				filter = { range: { [`stats.${statName}`]: { lte: value } } };
				break;
			case 'range':
				filter = {
					range: { [`stats.${statName}`]: { gte: value, lte: upperValue } },
				};
				break;
		}

		this.filters.push(filter);
		return this;
	}

	/**
	 * Add aggregation
	 */
	aggregate(
		name: string,
		statName: string,
		type: 'avg' | 'sum' | 'min' | 'max' | 'cardinality' | 'percentiles',
		groupBy?: string,
	): this {
		if (groupBy) {
			this.aggregations[name] = {
				terms: { field: `stats.${groupBy}` },
				aggs: {
					[type]: { [type]: { field: `stats.${statName}` } },
				},
			};
		} else {
			this.aggregations[name] = {
				[type]: { field: `stats.${statName}` },
			};
		}

		return this;
	}

	/**
	 * Execute the built query
	 */
	async execute(): Promise<any> {
		const must: any[] = [...this.filters];

		if (this.gameIds.length > 0) {
			must.push({ terms: { game: this.gameIds } });
		}

		if (this.leaderboardIds.length > 0) {
			must.push({
				terms: { leaderboard: this.leaderboardIds.map((id) => id.toString()) },
			});
		}

		const query = {
			index: 'scores-*',
			body: {
				size: 0,
				query: { bool: { must } },
				aggs: this.aggregations,
			},
		};

		// This would execute against elasticsearch
		console.log('Executing dynamic query:', JSON.stringify(query, null, 2));

		return { query, results: 'placeholder' };
	}
}

/**
 * Example usage of query builder
 */
export function queryBuilderExample(): void {
	const query = new DynamicStatsQueryBuilder()
		.filterByGames([1, 2, 3])
		.filterByStat('time', 'lt', 300) // Under 5 minutes
		.filterByStat('deaths', 'lte', 5) // 5 or fewer deaths
		.aggregate('avg_time', 'time', 'avg')
		.aggregate('time_by_route', 'time', 'avg', 'route')
		.execute();

	console.log('Built dynamic query for speedrun analysis');
}
