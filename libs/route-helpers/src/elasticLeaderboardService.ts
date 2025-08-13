import { client as elasticsearch } from '@lyku/elasticsearch-client';
import { client as redis } from '@lyku/redis-client';
import type { Score } from '@lyku/json-models';
import { pack, unpack } from 'msgpackr';
import { DateTime } from 'luxon';

// Type helpers for OpenSearch responses
interface OpenSearchResponse {
	body: {
		hits: {
			hits: Array<{
				_source?: Record<string, any>;
				_index: string;
			}>;
		};
		aggregations?: Record<string, any>;
	};
}

export interface StatColumn {
	name: string;
	type: 'number' | 'string' | 'time' | 'boolean';
	unit?: string;
	description?: string;
	category?: string;
	aggregatable?: boolean;
	sortable?: boolean;
}

export interface ScoreDocument {
	id: string;
	user: string;
	channel?: string;
	leaderboard: string;
	score: number | string;
	first_column: string;
	columns: string[];
	// Dynamic column storage strategies
	stats: Record<string, any>; // Flattened object for flexible stats
	typed_stats: {
		numbers: Record<string, number>;
		strings: Record<string, string>;
		times: Record<string, number>; // stored as seconds
		booleans: Record<string, boolean>;
	};
	nested_stats: Array<{
		name: string;
		value: any;
		type: 'number' | 'string' | 'time' | 'boolean';
		unit?: string;
		category?: string;
	}>;
	created: string;
	updated: string;
	game: number;
	deleted?: string;
	reports: number;
	verified?: string;
	verifiers?: string[];
	stream?: string;
}

export interface LeaderboardResult {
	scores: Array<{
		user: bigint;
		score: number | string;
		rank: number;
		created: string;
		columns: string[];
	}>;
	total: number;
	took: number;
}

export class ElasticLeaderboardService {
	private static readonly INDEX_PREFIX = 'scores';

	/**
	 * Get index name for a given date (format: scores-YYYY-MM)
	 */
	private static getIndexName(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		return `${this.INDEX_PREFIX}-${year}-${month}`;
	}

	/**
	 * Get current month index name
	 */
	private static getCurrentIndexName(): string {
		return this.getIndexName(new Date());
	}

	/**
	 * Index a score document in Elasticsearch
	 */
	static async indexScore(score: Score): Promise<void> {
		// Skip indexing if user is invalid
		if (!score.user || score.user <= 0) {
			return;
		}
		const { stats, typedStats, nestedStats } = this.processColumns(
			score.columns,
			score.game,
		);

		const doc: ScoreDocument = {
			id: score.id.toString(),
			user: BigInt(score.user || 0).toString(),
			channel: score.channel ? score.channel.toString() : undefined,
			leaderboard: BigInt(score.leaderboard).toString(),
			score: this.parseScore(score.columns[0]),
			first_column: score.columns[0] || '',
			columns: score.columns,
			stats,
			typed_stats: typedStats,
			nested_stats: nestedStats,
			created: score.created.toISOString(),
			updated: score.updated.toISOString(),
			game: Number(score.game),
			deleted: score.deleted?.toISOString(),
			reports: Number(score.reports),
			verified: score.verified?.toISOString(),
			verifiers: score.verifiers?.map((v) => v.toString()),
			stream: score.stream,
		};

		const indexName = this.getIndexName(score.created);

		// Ensure index exists before indexing
		await this.ensureIndexExists(score.created);

		await elasticsearch.index({
			index: indexName,
			id: score.id.toString(),
			body: doc,
		});

		// Invalidate cache for this leaderboard
		await this.invalidateCache(score.leaderboard);
	}

	/**
	 * Delete a score from Elasticsearch
	 */
	static async deleteScore(scoreId: bigint): Promise<void> {
		// For deletes, we need to search across all indices to find the document
		try {
			const searchResponse = await elasticsearch.search({
				index: `${this.INDEX_PREFIX}-*`,
				ignore_unavailable: true,
				allow_no_indices: true,
				body: {
					query: {
						term: { id: scoreId.toString() },
					},
					size: 1,
				},
			});

			if (searchResponse.body.hits.hits.length > 0) {
				const hit = searchResponse.body.hits.hits[0];
				await elasticsearch.delete({
					index: hit._index,
					id: scoreId.toString(),
				});
			}
		} catch (error) {
			console.warn(`Failed to delete score ${scoreId}:`, error);
		}
	}

	/**
	 * Get leaderboard with best score per user
	 *
	 * @example
	 * // Get top 20 scores for all users
	 * const allScores = await ElasticLeaderboardService.getLeaderboard(leaderboardId, {
	 *   limit: 20,
	 *   orderDirection: 'desc'
	 * });
	 *
	 * // Get scores for a specific user only
	 * const userScores = await ElasticLeaderboardService.getLeaderboard(leaderboardId, {
	 *   user: 123n,
	 *   limit: 10
	 * });
	 */
	static async getLeaderboard(
		leaderboardId: bigint,
		options: {
			limit?: number;
			orderDirection?: 'asc' | 'desc';
			columnFormat?: 'number' | 'text' | 'time';
			sortColumnIndex?: number;
			framePoint?: string;
			frameSize?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
			user?: bigint;
		} = {},
	): Promise<LeaderboardResult> {
		const {
			limit = 20,
			orderDirection = 'desc',
			columnFormat = 'number',
			sortColumnIndex = 0,
			framePoint,
			frameSize,
			user,
		} = options;

		// Validate column index
		if (sortColumnIndex < 0 || sortColumnIndex > 10) {
			throw new Error(
				`Invalid sortColumnIndex: ${sortColumnIndex}. Must be between 0 and 10.`,
			);
		}

		// Calculate date range based on framePoint and frameSize
		let dateRange: { start: Date; end: Date } | undefined;
		if (frameSize) {
			const referenceDate = framePoint ? new Date(framePoint) : new Date();
			dateRange = this.calculateDateRange(referenceDate, frameSize);
			// Log both UTC and EST times for clarity
			const startEST = DateTime.fromJSDate(dateRange.start).setZone(
				'America/New_York',
			);
			const endEST = DateTime.fromJSDate(dateRange.end).setZone(
				'America/New_York',
			);
			console.log(
				`Date range for ${frameSize}: ${startEST.toFormat('yyyy-MM-dd HH:mm:ss zzz')} to ${endEST.toFormat('yyyy-MM-dd HH:mm:ss zzz')} (EST)`,
			);
			console.log(
				`Date range for ${frameSize}: ${dateRange.start.toISOString()} to ${dateRange.end.toISOString()} (UTC)`,
			);
		}

		const userKey = user ?? 'all';

		// Try cache first
		const cacheKey = `elastic_leaderboard:${leaderboardId}:${userKey}:${orderDirection}:${columnFormat}:${sortColumnIndex}:${frameSize || 'all'}:${framePoint || 'current'}`;
		const cached = await redis.getBuffer(cacheKey);
		if (cached) {
			return unpack(cached);
		}

		const startTime = Date.now();

		// Calculate which indices to search based on date range
		let indexPattern = `${this.INDEX_PREFIX}-*`;
		if (dateRange) {
			// Get list of indices that could contain data within the date range
			const indices = this.getIndicesForDateRange(
				dateRange.start,
				dateRange.end,
			);
			if (indices.length > 0) {
				indexPattern = indices.join(',');
				console.log(`Searching in specific indices: ${indexPattern}`);
			}
		}

		// Build aggregation query for best score per user
		const sortOrder = orderDirection === 'desc' ? 'desc' : 'asc';

		// Build aggregation to get best score per user
		const filters: any[] = [
			{ term: { leaderboard: leaderboardId.toString() } },
		];
		if (dateRange) {
			filters.push({
				range: {
					created: {
						gte: dateRange.start.toISOString(),
						lte: dateRange.end.toISOString(),
					},
				},
			});
		}
		if (user) {
			filters.push({
				term: { user: user.toString() },
			});
		}

		const query = {
			index: indexPattern,
			ignore_unavailable: true,
			allow_no_indices: true,
			body: {
				size: 0, // We only want aggregations, not hits
				query: {
					bool: {
						filter: filters,
						must_not: [{ term: { user: '0' } }],
					},
				},
				aggs: {
					users: {
						terms: {
							field: 'user',
							size: 10000, // Get all users
						},
						aggs: {
							best_score: {
								top_hits: {
									size: 1,
									_source: ['user', 'score', 'created', 'columns'],
									sort: [
										{
											score: { order: sortOrder },
										},
									],
								},
							},
						},
					},
				},
			},
		};

		try {
			console.log('Elasticsearch query:', JSON.stringify(query, null, 2));
			console.log('Date range filter applied:', dateRange ? 'YES' : 'NO');
			const response = (await elasticsearch.search(
				query as any,
			)) as OpenSearchResponse;
			const took = Date.now() - startTime;

			// Process aggregation results
			const userBuckets = response.body.aggregations?.['users']?.buckets || [];
			console.log(`Got ${userBuckets.length} user buckets from aggregation`);

			// Extract best score for each user from aggregation
			const allScores = userBuckets
				.map((bucket: any) => {
					const bestHit = bucket.best_score.hits.hits[0];
					if (!bestHit || !bestHit._source) {
						console.warn(`No best score found for user ${bucket.key}`);
						return null;
					}

					const source = bestHit._source;
					const columns = source.columns || [];
					let scoreValue;

					if (sortColumnIndex < columns.length) {
						scoreValue =
							columnFormat === 'number'
								? Number(columns[sortColumnIndex] || 0)
								: columns[sortColumnIndex] || '';
					} else {
						scoreValue = columnFormat === 'number' ? 0 : '';
					}

					console.log(
						`User ${bucket.key}: best score = ${scoreValue}, columns = [${columns.join(', ')}]`,
					);

					return {
						user: BigInt(bucket.key),
						score: scoreValue,
						created: source.created,
						columns: columns,
					};
				})
				.filter(Boolean); // Remove any null entries
			const sortedScores = allScores.sort((a: any, b: any) => {
				if (columnFormat === 'number') {
					const aVal = Number(a.score) || 0;
					const bVal = Number(b.score) || 0;
					return orderDirection === 'desc' ? bVal - aVal : aVal - bVal;
				} else {
					const aVal = String(a.score || '');
					const bVal = String(b.score || '');
					return orderDirection === 'desc'
						? bVal.localeCompare(aVal)
						: aVal.localeCompare(bVal);
				}
			});

			// Apply limit and set ranks
			const scores = sortedScores
				.slice(0, limit)
				.map((score: any, index: number) => ({
					user: score.user,
					score: score.score,
					rank: index + 1,
					created: score.created,
					columns: score.columns || [],
				}));

			const result: LeaderboardResult = {
				scores,
				total: allScores.length,
				took,
			};

			console.log(
				`Final leaderboard result: ${scores.length} scores, took ${took}ms`,
			);

			// Cache for longer if query was slow
			const ttl = took > 1000 ? 1800 : took > 500 ? 900 : 600;
			await redis.setex(cacheKey, ttl, pack(result));

			return result;
		} catch (error) {
			console.error(
				`Elasticsearch query failed for leaderboard ${leaderboardId} (column ${sortColumnIndex}):`,
				error,
			);
			console.error('Query that failed:', JSON.stringify(query, null, 2));
			// Return empty result on error
			return {
				scores: [],
				total: 0,
				took: Date.now() - startTime,
			};
		}
	}

	/**
	 * Get a specific user's rank in a leaderboard
	 * @param leaderboardId The leaderboard ID
	 * @param userId The user ID to get rank for
	 * @param options Query options (same as getLeaderboard)
	 * @returns The user's rank and score, or null if user not found
	 */
	static async getUserRank(
		leaderboardId: bigint,
		userId: bigint,
		options: {
			orderDirection?: 'asc' | 'desc';
			columnFormat?: 'number' | 'text' | 'time';
			sortColumnIndex?: number;
			framePoint?: string;
			frameSize?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
		} = {},
	): Promise<{
		rank: number;
		score: Score;
		total: number;
	} | null> {
		const {
			orderDirection = 'desc',
			columnFormat = 'number',
			sortColumnIndex = 0,
			framePoint,
			frameSize,
		} = options;

		// Validate column index
		if (sortColumnIndex < 0 || sortColumnIndex > 10) {
			throw new Error(
				`Invalid sortColumnIndex: ${sortColumnIndex}. Must be between 0 and 10.`,
			);
		}

		// Calculate date range based on framePoint and frameSize
		let dateRange: { start: Date; end: Date } | undefined;
		if (frameSize) {
			const referenceDate = framePoint ? new Date(framePoint) : new Date();
			dateRange = this.calculateDateRange(referenceDate, frameSize);
		}

		// Cache key for user rank
		const cacheKey = `elastic_user_rank:${leaderboardId}:${userId}:${orderDirection}:${columnFormat}:${sortColumnIndex}:${frameSize || 'all'}:${framePoint || 'current'}`;
		const cached = await redis.getBuffer(cacheKey);
		if (cached) {
			return unpack(cached);
		}

		const startTime = Date.now();

		// Calculate which indices to search based on date range
		let indexPattern = `${this.INDEX_PREFIX}-*`;
		if (dateRange) {
			const indices = this.getIndicesForDateRange(
				dateRange.start,
				dateRange.end,
			);
			if (indices.length > 0) {
				indexPattern = indices.join(',');
			}
		}

		// First, get the user's best score
		const userFilters: any[] = [
			{ term: { leaderboard: leaderboardId.toString() } },
			{ term: { user: userId.toString() } },
		];
		if (dateRange) {
			userFilters.push({
				range: {
					created: {
						gte: dateRange.start.toISOString(),
						lte: dateRange.end.toISOString(),
					},
				},
			});
		}

		const userQuery = {
			index: indexPattern,
			ignore_unavailable: true,
			allow_no_indices: true,
			body: {
				size: 0,
				query: {
					bool: {
						filter: userFilters,
						must_not: [{ term: { user: '0' } }],
					},
				},
				aggs: {
					user_best: {
						top_hits: {
							size: 1,
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
							],
							sort: [
								{
									score: { order: orderDirection === 'desc' ? 'desc' : 'asc' },
								},
							],
						},
					},
				},
			},
		};

		try {
			const userResponse = (await elasticsearch.search(
				userQuery as any,
			)) as OpenSearchResponse;

			const userHit =
				userResponse.body.aggregations?.['user_best']?.hits?.hits?.[0];
			if (!userHit || !userHit._source) {
				return null; // User not found or has no scores
			}

			const userSource = userHit._source;
			const userColumns = userSource.columns || [];
			let userScoreValue;

			if (sortColumnIndex < userColumns.length) {
				userScoreValue =
					columnFormat === 'number'
						? Number(userColumns[sortColumnIndex] || 0)
						: userColumns[sortColumnIndex] || '';
			} else {
				userScoreValue = columnFormat === 'number' ? 0 : '';
			}

			// Now count how many users have better scores
			const rankFilters: any[] = [
				{ term: { leaderboard: leaderboardId.toString() } },
			];
			if (dateRange) {
				rankFilters.push({
					range: {
						created: {
							gte: dateRange.start.toISOString(),
							lte: dateRange.end.toISOString(),
						},
					},
				});
			}

			// Add range filter for better scores
			if (columnFormat === 'number') {
				const numericScore = Number(userScoreValue) || 0;
				if (orderDirection === 'desc') {
					rankFilters.push({
						range: { score: { gt: numericScore } },
					});
				} else {
					rankFilters.push({
						range: { score: { lt: numericScore } },
					});
				}
			} else {
				// For text/time, we'll need to use a different approach
				// This is more complex and less efficient for non-numeric values
				const stringScore = String(userScoreValue || '');
				if (orderDirection === 'desc') {
					rankFilters.push({
						range: { 'columns.keyword': { gt: stringScore } },
					});
				} else {
					rankFilters.push({
						range: { 'columns.keyword': { lt: stringScore } },
					});
				}
			}

			const rankQuery = {
				index: indexPattern,
				ignore_unavailable: true,
				allow_no_indices: true,
				body: {
					size: 0,
					query: {
						bool: {
							filter: rankFilters,
							must_not: [{ term: { user: '0' } }],
						},
					},
					aggs: {
						better_users: {
							cardinality: {
								field: 'user',
							},
						},
						total_users: {
							cardinality: {
								field: 'user',
							},
						},
					},
				},
			};

			// Also get total user count
			const totalQuery = {
				index: indexPattern,
				ignore_unavailable: true,
				allow_no_indices: true,
				body: {
					size: 0,
					query: {
						bool: {
							filter: [
								{ term: { leaderboard: leaderboardId.toString() } },
								...(dateRange
									? [
											{
												range: {
													created: {
														gte: dateRange.start.toISOString(),
														lte: dateRange.end.toISOString(),
													},
												},
											},
										]
									: []),
							],
							must_not: [{ term: { user: '0' } }],
						},
					},
					aggs: {
						total_users: {
							cardinality: {
								field: 'user',
							},
						},
					},
				},
			};

			const [rankResponse, totalResponse] = await Promise.all([
				elasticsearch.search(rankQuery as any) as Promise<OpenSearchResponse>,
				elasticsearch.search(totalQuery as any) as Promise<OpenSearchResponse>,
			]);

			const betterUsersCount =
				rankResponse.body.aggregations?.['better_users']?.value || 0;
			const totalUsers =
				totalResponse.body.aggregations?.['total_users']?.value || 0;

			const rank = betterUsersCount + 1;
			const took = Date.now() - startTime;

			// Construct the Score object
			const scoreObject: Score = {
				id: BigInt(userSource.id),
				user: BigInt(userSource.user),
				channel: userSource.channel ? BigInt(userSource.channel) : undefined,
				reports: Number(userSource.reports || 0),
				columns: userColumns,
				leaderboard: BigInt(userSource.leaderboard),
				game: Number(userSource.game),
				created: new Date(userSource.created),
				updated: new Date(userSource.updated),
				deleted: userSource.deleted ? new Date(userSource.deleted) : undefined,
				verified: userSource.verified
					? new Date(userSource.verified)
					: undefined,
				verifiers: userSource.verifiers
					? userSource.verifiers.map((v: string) => BigInt(v))
					: undefined,
				stream: userSource.stream,
			};

			const result = {
				rank,
				score: scoreObject,
				total: totalUsers,
			};

			// Cache for a reasonable time
			const ttl = took > 1000 ? 1800 : took > 500 ? 900 : 600;
			await redis.setex(cacheKey, ttl, pack(result));

			return result;
		} catch (error) {
			console.error(
				`Failed to get user rank for user ${userId} in leaderboard ${leaderboardId}:`,
				error,
			);
			return null;
		}
	}

	/**
	 * Get leaderboard with user's specific rank included
	 * This is useful when you want both the top scores AND a specific user's position
	 *
	 * @example
	 * // Get top 20 scores plus user 123's rank (even if they're not in top 20)
	 * const result = await ElasticLeaderboardService.getLeaderboardWithUserRank(
	 *   leaderboardId,
	 *   123n,
	 *   { limit: 20, orderDirection: 'desc' }
	 * );
	 *
	 * // result.leaderboard contains top 20 scores
	 * // result.userRank contains user 123's rank and score (e.g., rank: 145)
	 */
	static async getLeaderboardWithUserRank(
		leaderboardId: bigint,
		userId: bigint,
		options: {
			limit?: number;
			orderDirection?: 'asc' | 'desc';
			columnFormat?: 'number' | 'text' | 'time';
			sortColumnIndex?: number;
			framePoint?: string;
			frameSize?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
		} = {},
	): Promise<{
		leaderboard: LeaderboardResult;
		userRank: {
			rank: number;
			score: Score;
			total: number;
		} | null;
	}> {
		// Run both queries in parallel for better performance
		const [leaderboard, userRank] = await Promise.all([
			this.getLeaderboard(leaderboardId, options),
			this.getUserRank(leaderboardId, userId, options),
		]);

		return {
			leaderboard,
			userRank,
		};
	}

	/**
	 * Bulk index multiple scores
	 */
	static async bulkIndexScores(scores: Array<Score>): Promise<void> {
		// Filter out invalid users
		const validScores = scores.filter((score) => score.user && score.user > 0);
		if (validScores.length === 0) return;

		// Ensure all necessary indices exist
		const uniqueDates = [
			...new Set(
				validScores.map((s) => s.created.toISOString().substring(0, 7)),
			),
		];
		for (const dateStr of uniqueDates) {
			const [year, month] = dateStr.split('-');
			const date = new Date(parseInt(year), parseInt(month) - 1);
			await this.ensureIndexExists(date);
		}

		const body = validScores.flatMap((score) => {
			const indexName = this.getIndexName(score.created);
			const { stats, typedStats, nestedStats } = this.processColumns(
				score.columns,
				score.game,
			);

			return [
				{ index: { _index: indexName, _id: score.id.toString() } },
				{
					id: score.id.toString(),
					user: BigInt(score.user || 0).toString(),
					channel: score.channel ? score.channel.toString() : undefined,
					leaderboard: BigInt(score.leaderboard).toString(),
					score: this.parseScore(score.columns[0]),
					first_column: score.columns[0] || '',
					columns: score.columns,
					stats,
					typed_stats: typedStats,
					nested_stats: nestedStats,
					created: score.created.toISOString(),
					updated: score.updated.toISOString(),
					game: Number(score.game),
					deleted: score.deleted?.toISOString(),
					reports: Number(score.reports),
					verified: score.verified?.toISOString(),
					verifiers: score.verifiers?.map((v) => v.toString()),
					stream: score.stream,
				} satisfies ScoreDocument,
			];
		});

		await elasticsearch.bulk({ body });

		// Invalidate cache for affected leaderboards
		const leaderboards = [...new Set(validScores.map((s) => s.leaderboard))];
		await Promise.all(leaderboards.map((id) => this.invalidateCache(id)));
	}

	/**
	 * Ensure index exists with proper mapping
	 */
	static async ensureIndexExists(date: Date): Promise<void> {
		const indexName = this.getIndexName(date);
		const exists = await elasticsearch.indices.exists({
			index: indexName,
		});

		if (!exists.body) {
			await elasticsearch.indices.create({
				index: indexName,
				body: {
					mappings: {
						properties: {
							id: { type: 'keyword' },
							user: { type: 'keyword', index: true },
							channel: { type: 'keyword' },
							leaderboard: { type: 'keyword', index: true },
							score: {
								type: 'double',
								fields: {
									text: { type: 'text' },
									keyword: { type: 'keyword' },
								},
							},
							first_column: {
								type: 'text',
								fields: {
									keyword: { type: 'keyword' },
								},
							},
							columns: {
								type: 'text',
								fields: {
									keyword: { type: 'keyword' },
								},
							},
							// Dynamic stats storage
							stats: {
								type: 'object',
								dynamic: 'true' as any,
							},
							typed_stats: {
								properties: {
									numbers: { type: 'object', dynamic: 'true' as any },
									strings: { type: 'object', dynamic: 'true' as any },
									times: { type: 'object', dynamic: 'true' as any },
									booleans: { type: 'object', dynamic: 'true' as any },
								},
							},
							nested_stats: {
								type: 'nested',
								properties: {
									name: { type: 'keyword' },
									value: {
										type: 'keyword',
										fields: {
											number: { type: 'double' },
											text: { type: 'text' },
										},
									},
									type: { type: 'keyword' },
									unit: { type: 'keyword' },
									category: { type: 'keyword' },
								},
							},
							created: { type: 'date' },
							updated: { type: 'date' },
							game: { type: 'integer' },
							deleted: { type: 'date' },
							reports: { type: 'integer' },
							verified: { type: 'date' },
							verifiers: { type: 'keyword' },
							stream: { type: 'keyword' },
						},
					},
					settings: {
						number_of_shards: 1,
						number_of_replicas: 1,
						refresh_interval: '5s',
					},
				},
			});
		}
	}

	/**
	 * Sync score from PostgreSQL to Elasticsearch
	 */
	static async syncScore(score: any): Promise<void> {
		// Skip if user is invalid
		if (!score.user || score.user <= 0) {
			return;
		}

		if (score.deleted) {
			await this.deleteScore(score.id);
		} else {
			// Ensure index exists before indexing
			await this.ensureIndexExists(score.created);

			await this.indexScore({
				id: score.id,
				user: score.user,
				leaderboard: score.leaderboard,
				columns: score.columns || [],
				created: score.created,
				updated: score.updated,
				game: score.game,
				deleted: score.deleted ? new Date(score.deleted) : undefined,
				reports: score.reports || 0,
			});
		}
	}

	/**
	 * Invalidate cache for a leaderboard
	 */
	static async invalidateCache(leaderboardId: bigint): Promise<void> {
		const pattern = `elastic_leaderboard:${leaderboardId}:*`;
		const keys = await redis.keys(pattern);
		if (keys.length > 0) {
			await redis.del(...keys);
		}
	}

	/**
	 * Create the scores index with proper mapping
	 */
	static async createIndex(): Promise<void> {
		const currentIndex = this.getCurrentIndexName();
		const exists = await elasticsearch.indices.exists({
			index: currentIndex,
		});

		if (!exists.body) {
			await elasticsearch.indices.create({
				index: currentIndex,
				body: {
					mappings: {
						properties: {
							id: { type: 'keyword' },
							user: { type: 'keyword', index: true },
							channel: { type: 'keyword' },
							leaderboard: { type: 'keyword', index: true },
							score: {
								type: 'double',
								fields: {
									text: { type: 'text' },
									keyword: { type: 'keyword' },
								},
							},
							first_column: {
								type: 'text',
								fields: {
									keyword: { type: 'keyword' },
								},
							},
							columns: {
								type: 'text',
								fields: {
									keyword: { type: 'keyword' },
								},
							},
							// Dynamic stats storage
							stats: {
								type: 'object',
								dynamic: 'true' as any,
							},
							typed_stats: {
								properties: {
									numbers: { type: 'object', dynamic: 'true' as any },
									strings: { type: 'object', dynamic: 'true' as any },
									times: { type: 'object', dynamic: 'true' as any },
									booleans: { type: 'object', dynamic: 'true' as any },
								},
							},
							nested_stats: {
								type: 'nested',
								properties: {
									name: { type: 'keyword' },
									value: {
										type: 'keyword',
										fields: {
											number: { type: 'double' },
											text: { type: 'text' },
										},
									},
									type: { type: 'keyword' },
									unit: { type: 'keyword' },
									category: { type: 'keyword' },
								},
							},
							created: { type: 'date' },
							updated: { type: 'date' },
							game: { type: 'integer' },
							deleted: { type: 'date' },
							reports: { type: 'integer' },
							verified: { type: 'date' },
							verifiers: { type: 'keyword' },
							stream: { type: 'keyword' },
						},
					},
					settings: {
						number_of_shards: 1,
						number_of_replicas: 1,
						refresh_interval: '5s',
					},
				},
			});
		}
	}

	/**
	 * Parse score value, handling different formats
	 */
	private static parseScore(scoreStr: string): number | string {
		// Try to parse as number first
		const num = Number(scoreStr);
		if (!isNaN(num) && isFinite(num)) {
			return num;
		}
		// Return as string for text/time values
		return scoreStr;
	}

	/**
	 * Process columns into different storage formats for flexibility
	 */
	private static processColumns(
		columns: string[],
		gameId: number,
	): {
		stats: Record<string, any>;
		typedStats: {
			numbers: Record<string, number>;
			strings: Record<string, string>;
			times: Record<string, number>;
			booleans: Record<string, boolean>;
		};
		nestedStats: Array<{
			name: string;
			value: any;
			type: 'number' | 'string' | 'time' | 'boolean';
			unit?: string;
			category?: string;
		}>;
	} {
		const stats: Record<string, any> = {};
		const typedStats = {
			numbers: {} as Record<string, number>,
			strings: {} as Record<string, string>,
			times: {} as Record<string, number>,
			booleans: {} as Record<string, boolean>,
		};
		const nestedStats: Array<any> = [];

		// Get column schema for this game (you'd implement this based on your game config)
		const columnSchema = this.getColumnSchema(gameId);

		columns.forEach((value, index) => {
			const schema = columnSchema[index];
			const columnName = schema?.name || `column_${index}`;
			const columnType = schema?.type || this.inferType(value);

			// Store in flattened stats object
			stats[columnName] = this.parseValue(value, columnType);

			// Store in typed buckets
			const parsedValue = this.parseValue(value, columnType);
			switch (columnType) {
				case 'number':
					typedStats.numbers[columnName] = parsedValue as number;
					break;
				case 'time':
					typedStats.times[columnName] = this.parseTimeToSeconds(value);
					break;
				case 'boolean':
					typedStats.booleans[columnName] = parsedValue as boolean;
					break;
				default:
					typedStats.strings[columnName] = String(value);
			}

			// Store in nested format with metadata
			nestedStats.push({
				name: columnName,
				value: parsedValue,
				type: columnType,
				unit: schema?.unit,
				category: schema?.category || 'general',
			});
		});

		return { stats, typedStats, nestedStats };
	}

	/**
	 * Get column schema for a game (implement based on your game configuration)
	 */
	private static getColumnSchema(
		gameId: number,
	): Array<StatColumn | undefined> {
		// This would be loaded from your game configuration
		// For now, return a default schema
		const commonSchemas: Record<number, StatColumn[]> = {
			1: [
				// Mario speedrun example
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
			],
			2: [
				// Puzzle game example
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
					name: 'difficulty',
					type: 'string',
					description: 'Difficulty level',
					aggregatable: false,
					sortable: true,
				},
			],
			// Add more game schemas as needed
		};

		return commonSchemas[gameId] || [];
	}

	/**
	 * Infer the type of a column value
	 */
	private static inferType(
		value: string,
	): 'number' | 'string' | 'time' | 'boolean' {
		// Check for time format (MM:SS, HH:MM:SS, etc.)
		if (
			/^\d{1,2}:\d{2}(\.\d+)?$/.test(value) ||
			/^\d{1,2}:\d{2}:\d{2}(\.\d+)?$/.test(value)
		) {
			return 'time';
		}

		// Check for boolean
		if (/^(true|false|yes|no|1|0)$/i.test(value)) {
			return 'boolean';
		}

		// Check for number
		if (!isNaN(Number(value)) && isFinite(Number(value))) {
			return 'number';
		}

		return 'string';
	}

	/**
	 * Parse value based on inferred type
	 */
	private static parseValue(
		value: string,
		type: 'number' | 'string' | 'time' | 'boolean',
	): any {
		switch (type) {
			case 'number':
				return Number(value) || 0;
			case 'time':
				return this.parseTimeToSeconds(value);
			case 'boolean':
				return /^(true|yes|1)$/i.test(value);
			default:
				return value;
		}
	}

	/**
	 * Parse time string to seconds
	 */
	private static parseTimeToSeconds(timeStr: string): number {
		const parts = timeStr.split(':');
		let seconds = 0;

		if (parts.length === 3) {
			// HH:MM:SS.MS
			seconds += parseInt(parts[0]) * 3600;
			seconds += parseInt(parts[1]) * 60;
			seconds += parseFloat(parts[2]);
		} else if (parts.length === 2) {
			// MM:SS.MS
			seconds += parseInt(parts[0]) * 60;
			seconds += parseFloat(parts[1]);
		} else {
			// SS.MS
			seconds = parseFloat(parts[0]);
		}

		return seconds;
	}

	/**
	 * Aggregate on dynamic stats columns
	 */
	static async aggregateOnStats(
		leaderboardIds: bigint[],
		statName: string,
		aggregationType:
			| 'avg'
			| 'sum'
			| 'min'
			| 'max'
			| 'cardinality'
			| 'percentiles' = 'avg',
		options: {
			groupBy?: string;
			filters?: Record<string, any>;
			timeRange?: { start: Date; end: Date };
		} = {},
	): Promise<{
		aggregation: any;
		buckets?: Array<{
			key: string;
			doc_count: number;
			value: number;
		}>;
	}> {
		const { groupBy, filters = {}, timeRange } = options;

		const must: any[] = [
			{ terms: { leaderboard: leaderboardIds.map((id) => id.toString()) } },
		];

		// Add time range filter
		if (timeRange) {
			must.push({
				range: {
					created: {
						gte: timeRange.start.toISOString(),
						lte: timeRange.end.toISOString(),
					},
				},
			});
		}

		// Add custom filters
		Object.entries(filters).forEach(([key, value]) => {
			must.push({ term: { [`stats.${key}`]: value } });
		});

		// Build aggregation
		const aggs: any = {};

		if (groupBy) {
			aggs.groups = {
				terms: { field: `stats.${groupBy}` },
				aggs: {
					stat_value: {
						[aggregationType]: { field: `stats.${statName}` },
					},
				},
			};
		} else {
			aggs.stat_value = {
				[aggregationType]: { field: `stats.${statName}` },
			};
		}

		const query = {
			index: `${this.INDEX_PREFIX}-*`,
			ignore_unavailable: true,
			allow_no_indices: true,
			body: {
				size: 0,
				query: { bool: { must } },
				aggs,
			},
		};

		try {
			const response = (await elasticsearch.search(
				query as any,
			)) as OpenSearchResponse;

			const aggregations = response.body.aggregations;
			if (!aggregations) {
				return { aggregation: null };
			}

			if (groupBy) {
				const groups = aggregations['groups'];
				return {
					aggregation: groups,
					buckets:
						groups?.buckets?.map((bucket: any) => ({
							key: bucket.key,
							doc_count: bucket.doc_count,
							value: bucket.stat_value.value,
						})) || [],
				};
			} else {
				const statValue = aggregations['stat_value'];
				return {
					aggregation: statValue?.value || null,
				};
			}
		} catch (error) {
			console.error(`Stats aggregation failed for stat ${statName}:`, error);
			return { aggregation: null };
		}
	}

	/**
	 * Get available stats for a game or leaderboard
	 */
	static async getAvailableStats(
		gameId?: number,
		leaderboardId?: bigint,
	): Promise<{
		stats: Array<{
			name: string;
			type: string;
			sampleValues: any[];
			uniqueCount: number;
		}>;
	}> {
		const must: any[] = [];

		if (gameId) must.push({ term: { game: gameId } });
		if (leaderboardId)
			must.push({ term: { leaderboard: leaderboardId.toString() } });

		const query = {
			index: `${this.INDEX_PREFIX}-*`,
			ignore_unavailable: true,
			allow_no_indices: true,
			body: {
				size: 0,
				query: { bool: { must } },
				aggs: {
					stats_keys: {
						nested: { path: 'nested_stats' },
						aggs: {
							stat_names: {
								terms: { field: 'nested_stats.name', size: 100 },
								aggs: {
									types: { terms: { field: 'nested_stats.type' } },
									sample_values: {
										top_hits: {
											_source: ['nested_stats.value'],
											size: 5,
										},
									},
								},
							},
						},
					},
				},
			},
		};

		try {
			const response = (await elasticsearch.search(
				query as any,
			)) as OpenSearchResponse;
			const aggregations = response.body.aggregations;
			if (!aggregations) {
				return { stats: [] };
			}

			const buckets = aggregations['stats_keys']?.['stat_names']?.buckets || [];

			const stats = buckets.map((bucket: any) => ({
				name: bucket.key,
				type: bucket.types.buckets[0]?.key || 'unknown',
				sampleValues: bucket.sample_values.hits.hits.map(
					(hit: any) => hit._source.nested_stats.value,
				),
				uniqueCount: bucket.doc_count,
			}));

			return { stats };
		} catch (error) {
			console.error('Failed to get available stats:', error);
			return { stats: [] };
		}
	}

	/**
	 * Get leaderboard statistics
	 */
	static async getLeaderboardStats(leaderboardId: bigint): Promise<{
		totalScores: number;
		uniqueUsers: number;
		averageScore?: number;
		topScore?: number | string;
		availableStats?: Array<{ name: string; type: string }>;
	}> {
		const response = (await elasticsearch.search({
			index: `${this.INDEX_PREFIX}-*`,
			ignore_unavailable: true,
			allow_no_indices: true,
			body: {
				size: 0,
				query: {
					bool: {
						filter: [{ term: { leaderboard: leaderboardId.toString() } }],
						must_not: [{ term: { user: '0' } }],
					},
				},
				aggs: {
					total_scores: { value_count: { field: 'id' } },
					unique_users: { cardinality: { field: 'user' } },
					avg_score: { avg: { field: 'score' } },
					top_score: { max: { field: 'score' } },
				},
			},
		} as any)) as OpenSearchResponse;

		const aggs = response.body.aggregations;

		// Get available stats for this leaderboard
		const statsInfo = await this.getAvailableStats(undefined, leaderboardId);

		return {
			totalScores: aggs?.['total_scores']?.value || 0,
			uniqueUsers: aggs?.['unique_users']?.value || 0,
			averageScore: aggs?.['avg_score']?.value,
			topScore: aggs?.['top_score']?.value,
			availableStats: statsInfo.stats.map((s) => ({
				name: s.name,
				type: s.type,
			})),
		};
	}

	/**
	 * Get list of indices that could contain data within the given date range
	 */
	private static getIndicesForDateRange(start: Date, end: Date): string[] {
		const indices: string[] = [];
		const current = new Date(start);

		// Iterate through months from start to end
		while (current <= end) {
			indices.push(this.getIndexName(current));
			// Move to next month
			current.setMonth(current.getMonth() + 1);
		}

		// Remove duplicates
		return [...new Set(indices)];
	}

	/**
	 * Calculate date range based on reference date and frame size
	 * Uses EST timezone for all calculations
	 */
	private static calculateDateRange(
		referenceDate: Date,
		frameSize: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year',
	): { start: Date; end: Date } {
		// Convert input date to EST timezone
		const estDate =
			DateTime.fromJSDate(referenceDate).setZone('America/New_York');
		let startEST: DateTime;
		let endEST: DateTime;

		switch (frameSize) {
			case 'hour':
				startEST = estDate.startOf('hour');
				endEST = estDate.endOf('hour');
				break;
			case 'day':
				startEST = estDate.startOf('day');
				endEST = estDate.endOf('day');
				break;
			case 'week':
				// Week starts on Monday in luxon by default
				startEST = estDate.startOf('week');
				endEST = estDate.endOf('week');
				break;
			case 'month':
				startEST = estDate.startOf('month');
				endEST = estDate.endOf('month');
				break;
			case 'quarter':
				startEST = estDate.startOf('quarter');
				endEST = estDate.endOf('quarter');
				break;
			case 'year':
				startEST = estDate.startOf('year');
				endEST = estDate.endOf('year');
				break;
		}

		// Convert back to JS Date objects (these will be in UTC for storage)
		// But the boundaries are calculated based on EST
		return {
			start: startEST.toJSDate(),
			end: endEST.toJSDate(),
		};
	}
}
