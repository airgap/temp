#!/usr/bin/env tsx

import { Client } from '@opensearch-project/opensearch';
import { Pool } from '@neondatabase/serverless';
import { neonConfig } from '@neondatabase/serverless';

/**
 * Standalone script to set up Elasticsearch for leaderboards
 * This version works without monorepo imports
 */

interface ScoreDocument {
	id: string;
	user: string;
	leaderboard: string;
	columns: string[];
	created: string;
	updated: string;
	game?: number;
	deleted: string;
	reports: number;
}

class ElasticsearchSetup {
	private elasticsearch: Client;
	private pgPool: Pool;
	private static readonly INDEX_PREFIX = 'scores';

	private static getIndexName(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		return `${this.INDEX_PREFIX}-${year}-${month}`;
	}

	constructor() {
		const elasticUrl = process.env['ELASTIC_CONNECTION_STRING'];
		const pgUrl = process.env['PG_CONNECTION_STRING'];

		if (!elasticUrl) {
			throw new Error(
				'ELASTIC_CONNECTION_STRING environment variable not set!',
			);
		}
		if (!pgUrl) {
			throw new Error('PG_CONNECTION_STRING environment variable not set!');
		}

		this.elasticsearch = new Client({
			node: elasticUrl,
		});

		// Configure Neon for Node.js environments
		neonConfig.webSocketConstructor = require('ws');

		this.pgPool = new Pool({
			connectionString: pgUrl,
			max: 1,
			idleTimeoutMillis: 10000,
			connectionTimeoutMillis: 30000,
			ssl: {
				rejectUnauthorized: true,
			},
		});
	}

	async checkHealth(): Promise<void> {
		console.log('🩺 Checking Elasticsearch health...');

		try {
			const health = await this.elasticsearch.cluster.health();
			console.log(`💚 Cluster status: ${health.body.status}`);
			console.log(`📊 Active shards: ${health.body.active_shards}`);

			const info = await this.elasticsearch.info();
			console.log(`🔧 Elasticsearch version: ${info.body.version.number}`);
		} catch (error) {
			console.error('❌ Health check failed:', error);
			throw error;
		}
	}
	private parseScore(scoreStr: string): number | string {
		const num = Number(scoreStr);
		if (!isNaN(num) && isFinite(num)) {
			return num;
		}
		return scoreStr;
	}

	async syncExistingScores(): Promise<void> {
		console.log('📊 Syncing existing scores from PostgreSQL...');

		let client;
		try {
			console.log('🔌 Connecting to PostgreSQL...');
			client = await this.pgPool.connect();

			// Get all scores from PostgreSQL
			console.log('🔍 Querying scores from PostgreSQL...');
			const result = await client.query(`
				SELECT id, "user", leaderboard, columns, created, updated, game, deleted, reports
				FROM scores
				WHERE "user" > 0
				ORDER BY id ASC
			`);

			const scores = result.rows;
			console.log(`📈 Found ${scores.length} scores to sync`);

			if (scores.length === 0) {
				console.log('🎯 No scores to sync');
				return;
			}

			// Process in batches to avoid overwhelming Elasticsearch
			const batchSize = 1000;
			const batches = Math.ceil(scores.length / batchSize);

			for (let i = 0; i < batches; i++) {
				const start = i * batchSize;
				const end = Math.min(start + batchSize, scores.length);
				const batch = scores.slice(start, end);

				console.log(
					`⚡ Processing batch ${i + 1}/${batches} (${batch.length} scores)...`,
				);

				const body = batch.flatMap((score: any) => [
					{
						index: {
							_index: ElasticsearchSetup.getIndexName(score.created),
							_id: score.id.toString(),
						},
					},
					{
						id: score.id.toString(),
						user: BigInt(score.user || 0).toString(),
						leaderboard: BigInt(score.leaderboard).toString(),
						score: this.parseScore(score.columns[0]),
						first_column: score.columns[0] || '',
						columns: score.columns,
						created: score.created.toISOString(),
						updated: score.updated.toISOString(),
						game: Number(score.game || 1),
						deleted: score.deleted?.toISOString(),
						reports: Number(score.reports || 0),
					} as ScoreDocument,
				]);

				await this.elasticsearch.bulk({ body });

				// Small delay to avoid overwhelming the cluster
				await new Promise((resolve) => setTimeout(resolve, 100));
			}

			console.log('✨ All scores synced successfully');
		} catch (error) {
			console.error('❌ Failed to sync scores:', error);
			throw error;
		} finally {
			if (client) {
				client.release();
			}
		}
	}

	async verifySync(): Promise<void> {
		console.log('🔍 Verifying sync...');

		let client;
		try {
			console.log('🔌 Connecting to PostgreSQL for verification...');
			client = await this.pgPool.connect();

			// Get count from PostgreSQL
			console.log('🔢 Counting PostgreSQL scores...');
			const pgResult = await client.query(`
				SELECT COUNT(*) as count
				FROM scores
				WHERE "user" > 0
			`);
			const pgTotal = parseInt(pgResult.rows[0].count);

			// Get count from Elasticsearch
			const esResponse = await this.elasticsearch.count({
				index: 'scores-*',
				body: {
					query: {
						bool: {
							// filter: [{ term: { deleted: false } }],
							must_not: [{ term: { user: '0' } }],
						},
					},
				},
			});
			const esTotal = esResponse.body.count;

			console.log(`📊 PostgreSQL: ${pgTotal} scores`);
			console.log(`📊 Elasticsearch: ${esTotal} scores`);

			if (pgTotal === esTotal) {
				console.log('✅ Sync verification successful - counts match!');
			} else {
				console.warn(
					'⚠️  Count mismatch detected - some scores may not have synced',
				);
			}

			// Show some sample leaderboard data
			console.log('🏆 Checking sample leaderboards...');
			const leaderboardsResult = await client.query(`
				SELECT id, title
				FROM leaderboards
				LIMIT 3
			`);

			console.log('\n📈 Sample leaderboard queries:');
			for (const leaderboard of leaderboardsResult.rows) {
				try {
					const startTime = Date.now();
					const result = await this.elasticsearch.search({
						index: 'scores*',
						body: {
							size: 0,
							query: {
								bool: {
									filter: [
										{ term: { leaderboard: leaderboard.id.toString() } },
										// { term: { deleted: false } },
									],
									must_not: [{ term: { user: '0' } }],
								},
							},
							// aggs: {
							// 	users: {
							// 		terms: {
							// 			field: 'user',
							// 			size: 5,
							// 		},
							// 		aggs: {
							// 			best_score: {
							// 				top_hits: {
							// 					sort: [{ score: { order: 'desc' } }],
							// 					_source: ['user', 'score'],
							// 					size: 1,
							// 				},
							// 			},
							// 		},
							// 	},
							// },
						},
					} as any);
					const took = Date.now() - startTime;
					const userCount =
						(result.body.aggregations as any)?.users?.buckets?.length || 0;
					console.log(
						`🏆 ${leaderboard.title || leaderboard.id}: ${userCount} users (${took}ms)`,
					);
				} catch (error) {
					console.log(
						`❌ ${leaderboard.title || leaderboard.id}: Query failed`,
					);
				}
			}
		} catch (error) {
			console.error('❌ Verification failed:', error);
			throw error;
		} finally {
			if (client) {
				client.release();
			}
		}
	}

	async cleanup(): Promise<void> {
		await this.pgPool.end();
	}
}

// Main execution
async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	const setup = new ElasticsearchSetup();

	try {
		console.log('🚀 Elasticsearch Leaderboard Setup\n');

		switch (command) {
			case 'health':
				await setup.checkHealth();
				break;

			case 'sync':
				await setup.checkHealth();
				await setup.syncExistingScores();
				await setup.verifySync();
				break;

			case 'verify':
				await setup.verifySync();
				break;

			case 'full':
			case undefined:
				await setup.checkHealth();
				await setup.syncExistingScores();
				await setup.verifySync();
				break;

			default:
				console.log('Usage:');
				console.log(
					'  tsx scripts/setup-elasticsearch-leaderboards.ts            # Full setup',
				);
				console.log(
					'  tsx scripts/setup-elasticsearch-leaderboards.ts full      # Full setup',
				);
				console.log(
					'  tsx scripts/setup-elasticsearch-leaderboards.ts health    # Check health',
				);
				console.log(
					'  tsx scripts/setup-elasticsearch-leaderboards.ts create-index # Create index only',
				);
				console.log(
					'  tsx scripts/setup-elasticsearch-leaderboards.ts recreate-index # Delete and recreate index',
				);
				console.log(
					'  tsx scripts/setup-elasticsearch-leaderboards.ts sync      # Create + sync data',
				);
				console.log(
					'  tsx scripts/setup-elasticsearch-leaderboards.ts verify    # Verify sync',
				);
				process.exit(1);
		}

		console.log('\n🎉 Setup completed successfully!');
		console.log('\n💡 Next steps:');
		console.log(
			'  - Your leaderboard routes now use Elasticsearch for blazing fast queries',
		);
		console.log('  - New scores are automatically synced to Elasticsearch');
		console.log('  - Redis caching provides additional performance boost');
		console.log('  - Monitor performance and scale as needed');
	} catch (error) {
		console.error('\n💥 Setup failed:', error);
		process.exit(1);
	} finally {
		await setup.cleanup();
		process.exit(0);
	}
}

// Execute immediately since this is a script
main();
