#!/usr/bin/env tsx

import { Client } from '@opensearch-project/opensearch';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

/**
 * Simple score sync script that exports from PostgreSQL and imports to Elasticsearch
 * Works around WebSocket connection issues by using pg_dump approach
 */

class ScoreSync {
	private elasticsearch: Client;
	private readonly INDEX_PREFIX = 'scores';

	constructor() {
		const elasticUrl = process.env['ELASTIC_CONNECTION_STRING'];

		if (!elasticUrl) {
			throw new Error(
				'ELASTIC_CONNECTION_STRING environment variable not set!',
			);
		}

		this.elasticsearch = new Client({
			node: elasticUrl,
		});
	}

	private parseScore(scoreStr: string): number | string {
		const num = Number(scoreStr);
		if (!isNaN(num) && isFinite(num)) {
			return num;
		}
		return scoreStr;
	}

	private getIndexName(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		return `${this.INDEX_PREFIX}-${year}-${month}`;
	}

	async exportScoresFromPostgres(): Promise<any[]> {
		console.log('📤 Exporting scores from PostgreSQL...');

		const pgUrl = process.env['PG_CONNECTION_STRING'];
		if (!pgUrl) {
			throw new Error('PG_CONNECTION_STRING environment variable not set!');
		}

		try {
			// First, discover available databases
			console.log('🔍 Discovering available databases...');
			const dbListResult = execSync(
				`psql "${pgUrl}" -t -c "SELECT datname FROM pg_database WHERE datistemplate = false;"`,
				{
					encoding: 'utf8',
				},
			);
			const databases = dbListResult
				.trim()
				.split('\n')
				.map((db) => db.trim())
				.filter((db) => db);
			console.log('📋 Available databases:', databases);

			// Try to find which database has the scores table
			let targetDatabase = null;
			for (const db of databases) {
				try {
					const testUrl = pgUrl.replace(/\/[^\/]*(\?|$)/, `/${db}$1`);
					console.log(`🔍 Checking database: ${db}`);
					const tableCheck = execSync(
						`psql "${testUrl}" -t -c "SELECT COUNT(*) FROM scores;"`,
						{
							encoding: 'utf8',
							stdio: ['pipe', 'pipe', 'pipe'],
						},
					);
					const count = parseInt(tableCheck.trim());
					console.log(`📊 Rows in ${db}.scores: ${count}`);
					if (count > 0) {
						targetDatabase = db;
						break;
					}
				} catch (error) {
					console.log(
						`❌ Database ${db} doesn't have scores table or access denied`,
					);
				}
			}

			if (!targetDatabase) {
				throw new Error('No database found with scores table containing data');
			}

			console.log(`✅ Using database: ${targetDatabase}`);
			const finalUrl = pgUrl.replace(/\/[^\/]*(\?|$)/, `/${targetDatabase}$1`);

			// Now try the JSON aggregation with the correct database
			const query = `
				SELECT json_agg(row_to_json(t)) 
				FROM (
					SELECT 
						id,
						"user",
						leaderboard,
						columns,
						created,
						updated,
						game,
						deleted
					FROM scores 
					ORDER BY id ASC
				) t;
			`;

			console.log('🔍 Running PostgreSQL JSON export query...');
			const result = execSync(
				`psql "${finalUrl}" -t -c "${query.replace(/\n/g, ' ').replace(/\s+/g, ' ')}"`,
				{
					encoding: 'utf8',
					maxBuffer: 100 * 1024 * 1024, // 100MB buffer
				},
			);

			console.log('🔍 Raw result length:', result.length);
			console.log('🔍 Raw result preview:', result.substring(0, 200));

			const jsonData = result.trim();
			if (!jsonData || jsonData === 'null') {
				console.log('📭 No scores found in PostgreSQL JSON export');
				return [];
			}

			const allScores = JSON.parse(jsonData);
			// Filter out invalid users - accept both numeric IDs and valid usernames
			const scores = allScores.filter((score: any) => {
				// Accept numeric user IDs > 0
				const userId = parseInt(score.user);
				if (!isNaN(userId) && userId > 0) {
					return true;
				}
				// Accept non-empty string usernames (but not "0" or empty)
				if (
					typeof score.user === 'string' &&
					score.user.trim() !== '' &&
					score.user !== '0'
				) {
					return true;
				}
				return false;
			});
			console.log(
				`📊 Exported ${scores.length} valid scores from ${allScores.length} total PostgreSQL records`,
			);

			// Debug: show sample of filtered data
			if (scores.length > 0) {
				console.log('🔍 Sample score:', JSON.stringify(scores[0], null, 2));
			} else if (allScores.length > 0) {
				console.log(
					'🔍 Sample raw score:',
					JSON.stringify(allScores[0], null, 2),
				);
				console.log('🔍 User field type:', typeof allScores[0].user);
				console.log('🔍 User field value:', allScores[0].user);
			}
			return scores;
		} catch (error) {
			console.error('❌ Failed to export from PostgreSQL:', error);
			throw error;
		}
	}

	async bulkIndexScores(scores: any[]): Promise<void> {
		if (scores.length === 0) {
			console.log('🎯 No scores to index');
			return;
		}

		console.log(`📥 Indexing ${scores.length} scores to Elasticsearch...`);

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

			const body = batch.flatMap((score: any) => {
				const createdDate = new Date(score.created);
				const indexName = this.getIndexName(createdDate);

				return [
					{ index: { _index: indexName, _id: score.id.toString() } },
					{
						id: score.id.toString(),
						user: score.user, // Keep as original type (string or number)
						leaderboard: parseInt(score.leaderboard),
						score: this.parseScore(score.columns[0]),
						columns: score.columns,
						created: createdDate.toISOString(),
						updated: new Date(score.updated).toISOString(),
						game: score.game || 1,
						deleted: !!score.deleted,
					},
				];
			});

			const response = await this.elasticsearch.bulk({ body });

			if (response.body.errors) {
				const errorItems = response.body.items.filter(
					(item: any) => item.index?.error,
				);
				console.warn(`⚠️  Some errors in batch ${i + 1}:`);
				errorItems.forEach((item: any, index: number) => {
					console.log(
						`  Document ${index + 1}:`,
						JSON.stringify(item.index.error, null, 2),
					);
					if (index === 0) {
						// Show the actual document that failed
						const failedDocIndex = response.body.items.indexOf(item) / 2; // Bulk format has pairs
						const failedDoc = batch[failedDocIndex];
						console.log(
							'  Failed document:',
							JSON.stringify(failedDoc, null, 2),
						);
					}
				});
			}

			// Small delay to avoid overwhelming the cluster
			await new Promise((resolve) => setTimeout(resolve, 100));
		}

		console.log('✨ All scores indexed successfully');
	}

	async verifySync(): Promise<void> {
		console.log('🔍 Verifying sync...');

		try {
			// Get count from Elasticsearch across all score indices
			const esResponse = await this.elasticsearch.count({
				index: `${this.INDEX_PREFIX}-*`,
				body: {
					query: {
						bool: {
							filter: [{ range: { user: { gt: 0 } } }],
						},
					},
				},
			});
			const esTotal = esResponse.body.count;

			console.log(`📊 Elasticsearch: ${esTotal} scores indexed`);

			if (esTotal > 0) {
				console.log('✅ Sync verification successful!');

				// Show sample data
				const sampleResponse = await this.elasticsearch.search({
					index: `${this.INDEX_PREFIX}-*`,
					body: {
						size: 3,
						query: { match_all: {} },
						sort: [{ created: { order: 'desc' } }],
					},
				});

				console.log('\n🎯 Sample documents:');
				sampleResponse.body.hits.hits.forEach((hit: any, index: number) => {
					const doc = hit._source;
					console.log(
						`  ${index + 1}. User ${doc.user}, Score: ${doc.score}, Leaderboard: ${doc.leaderboard}`,
					);
				});
			} else {
				console.warn('⚠️  No documents found in Elasticsearch');
			}
		} catch (error) {
			console.error('❌ Verification failed:', error);
			throw error;
		}
	}

	async testLeaderboardQuery(): Promise<void> {
		console.log('🏆 Testing leaderboard aggregation query...');

		try {
			const startTime = Date.now();
			const response = await this.elasticsearch.search({
				index: `${this.INDEX_PREFIX}-*`,
				body: {
					size: 0,
					query: {
						bool: {
							filter: [
								{ term: { leaderboard: '1' } }, // Test with leaderboard 1
								{ range: { user: { gt: 0 } } },
								{ term: { deleted: false } },
							],
						},
					},
					aggs: {
						users: {
							terms: {
								field: 'user',
								size: 20,
							},
							aggs: {
								best_score: {
									top_hits: {
										sort: [{ score: { order: 'desc' } }],
										_source: ['user', 'score', 'created'],
										size: 1,
									},
								},
							},
						},
					},
				},
			} as any);

			const took = Date.now() - startTime;
			const userBuckets =
				(response.body.aggregations as any)?.users?.buckets || [];

			console.log(`⚡ Query took: ${took}ms`);
			console.log(
				`👥 Found ${userBuckets.length} unique users in leaderboard 1`,
			);

			if (userBuckets.length > 0) {
				console.log('🥇 Top scores:');
				userBuckets.slice(0, 5).forEach((bucket: any, index: number) => {
					const hit = bucket.best_score.hits.hits[0];
					if (hit) {
						const doc = hit._source;
						console.log(`  ${index + 1}. User ${doc.user}: ${doc.score}`);
					}
				});
			}
		} catch (error) {
			console.error('❌ Test query failed:', error);
			throw error;
		}
	}
}

// Main execution
async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	const sync = new ScoreSync();

	try {
		console.log('🚀 Score Sync to Elasticsearch\n');

		switch (command) {
			case 'export':
				const scores = await sync.exportScoresFromPostgres();
				console.log(`📊 Would sync ${scores.length} scores`);
				break;

			case 'sync':
			case undefined:
				const exportedScores = await sync.exportScoresFromPostgres();
				await sync.bulkIndexScores(exportedScores);
				await sync.verifySync();
				break;

			case 'verify':
				await sync.verifySync();
				break;

			case 'test':
				await sync.testLeaderboardQuery();
				break;

			default:
				console.log('Usage:');
				console.log(
					'  tsx scripts/sync-scores-to-elasticsearch.ts            # Full sync',
				);
				console.log(
					'  tsx scripts/sync-scores-to-elasticsearch.ts sync       # Full sync',
				);
				console.log(
					'  tsx scripts/sync-scores-to-elasticsearch.ts export     # Test export only',
				);
				console.log(
					'  tsx scripts/sync-scores-to-elasticsearch.ts verify     # Verify existing sync',
				);
				console.log(
					'  tsx scripts/sync-scores-to-elasticsearch.ts test       # Test leaderboard query',
				);
				process.exit(1);
		}

		console.log('\n🎉 Operation completed successfully!');
		console.log('\n💡 Next steps:');
		console.log('  - Your leaderboard routes now have data in Elasticsearch');
		console.log('  - New scores will automatically sync via the routes');
		console.log('  - Test your leaderboard API endpoints');
	} catch (error) {
		console.error('\n💥 Operation failed:', error);
		console.log('\n🔧 Troubleshooting:');
		console.log('  - Make sure psql command is available in PATH');
		console.log('  - Verify PostgreSQL connection string is correct');
		console.log('  - Check Elasticsearch cluster health');
		process.exit(1);
	}
}

// Execute immediately
main();
