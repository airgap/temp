import { client as pg } from '@lyku/postgres-client';
import { ElasticLeaderboardService } from '@lyku/route-helpers';

export default async function reindexScores() {
	console.log('🚀 Starting PostgreSQL to Elasticsearch reindex...');

	try {
		// First, create the index with proper mappings
		console.log('📋 Creating Elasticsearch index...');
		await ElasticLeaderboardService.createIndex();

		// Get all scores from PostgreSQL
		console.log('📤 Fetching scores from PostgreSQL...');
		const scores = await pg
			.selectFrom('scores')
			.selectAll()
			.where('deleted', 'is', null)
			.where('user', '>', 0)
			.orderBy('id', 'asc')
			.execute();

		console.log(`📊 Found ${scores.length} scores to index`);

		if (scores.length === 0) {
			console.log('😅 No scores to index!');
			return { success: true, indexed: 0 };
		}

		// Process in batches
		const batchSize = 500;
		const batches = Math.ceil(scores.length / batchSize);

		for (let i = 0; i < batches; i++) {
			const start = i * batchSize;
			const end = Math.min(start + batchSize, scores.length);
			const batch = scores.slice(start, end);

			console.log(
				`⚡ Processing batch ${i + 1}/${batches} (${batch.length} scores)...`,
			);

			// Use bulkIndexScores for efficiency
			await ElasticLeaderboardService.bulkIndexScores(batch);

			// Small delay between batches
			await new Promise((resolve) => setTimeout(resolve, 100));
		}

		console.log('✅ Reindexing complete!');

		// Test a query
		console.log('\n🧪 Testing leaderboard query...');
		const testResult = await ElasticLeaderboardService.getLeaderboard(1n, {
			limit: 5,
			orderDirection: 'desc',
			columnFormat: 'number',
			sortColumnIndex: 0,
		});

		console.log(`\n🏆 Top ${testResult.scores.length} scores:`);
		testResult.scores.forEach((score) => {
			console.log(
				`  Rank ${score.rank}: User ${score.user} - Score: ${score.score}`,
			);
		});

		return { success: true, indexed: scores.length };
	} catch (error) {
		console.error('❌ Reindex failed:', error);
		throw error;
	}
}
