#!/usr/bin/env tsx

import { Client } from '@opensearch-project/opensearch';

/**
 * Simplified Elasticsearch setup script
 * Just creates the index - no PostgreSQL sync needed
 */

class SimpleElasticsearchSetup {
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

	private getIndexName(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		return `${this.INDEX_PREFIX}-${year}-${month}`;
	}

	private getCurrentIndexName(): string {
		return this.getIndexName(new Date());
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

	async createIndex(): Promise<void> {
		const currentIndex = this.getCurrentIndexName();
		console.log(`🔍 Checking if ${currentIndex} index exists...`);

		try {
			const exists = await this.elasticsearch.indices.exists({
				index: currentIndex,
			});

			if (!exists.body) {
				console.log(`📋 Creating ${currentIndex} index...`);
				await this.elasticsearch.indices.create({
					index: currentIndex,
					body: {
						mappings: {
							properties: {
								id: { type: 'keyword' },
								user: { type: 'long', index: true },
								leaderboard: { type: 'long', index: true },
								score: {
									type: 'double',
									fields: {
										text: { type: 'text' },
										keyword: { type: 'keyword' },
									},
								},
								columns: {
									type: 'text',
									fields: {
										keyword: { type: 'keyword' },
									},
								},
								created: { type: 'date' },
								updated: { type: 'date' },
								game: { type: 'integer' },
								deleted: { type: 'boolean' },
							},
						},
						settings: {
							number_of_shards: 1,
							number_of_replicas: 1,
							refresh_interval: '5s',
						},
					},
				});
				console.log(`✅ ${currentIndex} index created successfully`);
			} else {
				console.log(`✅ ${currentIndex} index already exists`);
			}
		} catch (error) {
			console.error('❌ Failed to create index:', error);
			throw error;
		}
	}

	async deleteIndex(): Promise<void> {
		const currentIndex = this.getCurrentIndexName();
		console.log(`🗑️  Deleting ${currentIndex} index...`);

		try {
			const exists = await this.elasticsearch.indices.exists({
				index: currentIndex,
			});

			if (exists.body) {
				await this.elasticsearch.indices.delete({
					index: currentIndex,
				});
				console.log(`✅ ${currentIndex} index deleted successfully`);
			} else {
				console.log(`ℹ️  ${currentIndex} index doesn't exist`);
			}
		} catch (error) {
			console.error('❌ Failed to delete index:', error);
			throw error;
		}
	}

	async getIndexInfo(): Promise<void> {
		console.log('📊 Getting index information...');

		try {
			// Check for all score indices
			const allIndices = await this.elasticsearch.cat.indices({
				index: `${this.INDEX_PREFIX}-*`,
				format: 'json',
			});

			if (!allIndices.body || allIndices.body.length === 0) {
				console.log('❌ No score indices exist');
				return;
			}

			console.log(`📋 Found ${allIndices.body.length} score indices:`);
			allIndices.body.forEach((idx: any) => {
				console.log(
					`  - ${idx.index}: ${idx['docs.count']} docs, ${idx['store.size']}`,
				);
			});

			// Get detailed stats for current month's index
			const currentIndex = this.getCurrentIndexName();
			const exists = await this.elasticsearch.indices.exists({
				index: currentIndex,
			});

			if (!exists.body) {
				console.log(
					`ℹ️  Current month index (${currentIndex}) doesn't exist yet`,
				);
				return;
			}

			// Get index stats
			const stats = await this.elasticsearch.indices.stats({
				index: currentIndex,
			});

			const indexStats = stats.body.indices[currentIndex];
			console.log(`📈 Documents: ${indexStats.total.docs.count}`);
			console.log(
				`💾 Size: ${Math.round((indexStats.total.store.size_in_bytes / 1024 / 1024) * 100) / 100} MB`,
			);

			// Get mapping
			const mapping = await this.elasticsearch.indices.getMapping({
				index: currentIndex,
			});

			const properties = mapping.body[currentIndex].mappings.properties;
			console.log('🗂️  Fields:', Object.keys(properties).join(', '));
		} catch (error) {
			console.error('❌ Failed to get index info:', error);
			throw error;
		}
	}

	async testQuery(): Promise<void> {
		console.log('🔍 Testing sample query...');

		try {
			const response = await this.elasticsearch.search({
				index: `${this.INDEX_PREFIX}-*`,
				body: {
					size: 5,
					query: {
						match_all: {},
					},
					sort: [{ created: { order: 'desc' } }],
				},
			});

			const hits = response.body.hits;
			console.log(`📊 Total documents: ${hits.total.value || hits.total}`);
			console.log(`⚡ Query took: ${response.body.took}ms`);

			if (hits.hits.length > 0) {
				console.log('🎯 Sample documents:');
				hits.hits.forEach((hit: any, index: number) => {
					const doc = hit._source;
					console.log(
						`  ${index + 1}. User ${doc.user}, Score: ${doc.score}, Leaderboard: ${doc.leaderboard}`,
					);
				});
			} else {
				console.log('📭 No documents found');
			}
		} catch (error) {
			console.error('❌ Failed to test query:', error);
			throw error;
		}
	}
}

// Main execution
async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	const setup = new SimpleElasticsearchSetup();

	try {
		console.log('🚀 Simple Elasticsearch Setup\n');

		switch (command) {
			case 'health':
				await setup.checkHealth();
				break;

			case 'create':
			case 'create-index':
				await setup.checkHealth();
				await setup.createIndex();
				break;

			case 'delete':
			case 'delete-index':
				await setup.deleteIndex();
				break;

			case 'info':
				await setup.checkHealth();
				await setup.getIndexInfo();
				break;

			case 'test':
				await setup.checkHealth();
				await setup.testQuery();
				break;

			case 'reset':
				await setup.checkHealth();
				await setup.deleteIndex();
				await setup.createIndex();
				break;

			default:
				console.log('Usage:');
				console.log(
					'  tsx scripts/simple-elasticsearch-setup.ts health      # Check cluster health',
				);
				console.log(
					'  tsx scripts/simple-elasticsearch-setup.ts create      # Create scores index',
				);
				console.log(
					'  tsx scripts/simple-elasticsearch-setup.ts delete      # Delete scores index',
				);
				console.log(
					'  tsx scripts/simple-elasticsearch-setup.ts info        # Show index information',
				);
				console.log(
					'  tsx scripts/simple-elasticsearch-setup.ts test        # Test a query',
				);
				console.log(
					'  tsx scripts/simple-elasticsearch-setup.ts reset       # Delete and recreate index',
				);
				process.exit(1);
		}

		console.log('\n✅ Operation completed successfully!');
	} catch (error) {
		console.error('\n💥 Operation failed:', error);
		process.exit(1);
	}
}

// Execute immediately
main();
