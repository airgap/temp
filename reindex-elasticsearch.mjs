#!/usr/bin/env node

import { spawn } from 'child_process';

// Simple script to reindex scores from PostgreSQL to Elasticsearch
// Uses the existing route infrastructure

async function runCommand(command, args = []) {
	return new Promise((resolve, reject) => {
		const proc = spawn(command, args, {
			stdio: 'inherit',
			shell: true,
			env: { ...process.env },
		});

		proc.on('close', (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Command failed with code ${code}`));
			}
		});

		proc.on('error', reject);
	});
}

async function main() {
	console.log('🚀 Starting Elasticsearch reindex...\n');

	try {
		// First, let's create a temporary route to handle the reindex
		const reindexCode = `
import { client as pg } from '@lyku/postgres-client';
import { ElasticLeaderboardService } from '@lyku/route-helpers';

export default async () => {
	console.log('📋 Creating Elasticsearch index...');
	await ElasticLeaderboardService.createIndex();
	
	console.log('📤 Fetching scores from PostgreSQL...');
	const scores = await pg
		.selectFrom('scores')
		.selectAll()
		.where('deleted', 'is', null)
		.where('user', '>', 0)
		.orderBy('id', 'asc')
		.execute();
	
	console.log(\`📊 Found \${scores.length} scores to index\`);
	
	const batchSize = 500;
	const batches = Math.ceil(scores.length / batchSize);
	
	for (let i = 0; i < batches; i++) {
		const start = i * batchSize;
		const end = Math.min(start + batchSize, scores.length);
		const batch = scores.slice(start, end);
		
		console.log(\`⚡ Batch \${i + 1}/\${batches} (\${batch.length} scores)...\`);
		await ElasticLeaderboardService.bulkIndexScores(batch);
		await new Promise(r => setTimeout(r, 100));
	}
	
	console.log('✅ Reindexing complete!');
	
	// Test query
	const result = await ElasticLeaderboardService.getLeaderboard(1n, { limit: 5 });
	console.log(\`\\n🏆 Top \${result.scores.length} scores:\`);
	result.scores.forEach(s => {
		console.log(\`  Rank \${s.rank}: User \${s.user} - Score: \${s.score}\`);
	});
	
	return { success: true, indexed: scores.length };
};
`;

		// Write temporary route file
		console.log('📝 Creating temporary reindex route...');
		await runCommand('mkdir', ['-p', 'apps/routes/temp-reindex']);

		const fs = await import('fs/promises');
		await fs.writeFile('apps/routes/temp-reindex/index.ts', reindexCode);
		await fs.writeFile(
			'apps/routes/temp-reindex/package.json',
			JSON.stringify(
				{
					name: '@app/temp-reindex',
					version: '1.0.0',
					type: 'module',
					dependencies: {
						'@lyku/postgres-client': '*',
						'@lyku/route-helpers': '*',
					},
				},
				null,
				2,
			),
		);

		// Build and run
		console.log('🔨 Building temporary route...');
		await runCommand('npx', ['nx', 'run', 'temp-reindex:build']);

		console.log('🚀 Running reindex...\n');
		await runCommand('npx', ['nx', 'run', 'temp-reindex:serve']);

		// Cleanup
		console.log('\n🧹 Cleaning up...');
		await runCommand('rm', ['-rf', 'apps/routes/temp-reindex']);

		console.log('\n🎉 Reindex completed successfully!');
	} catch (error) {
		console.error('❌ Reindex failed:', error.message);

		// Cleanup on error
		try {
			await runCommand('rm', ['-rf', 'apps/routes/temp-reindex']);
		} catch {}

		process.exit(1);
	}
}

// Check if we have the sync-scores-to-elasticsearch script
import { existsSync } from 'fs';
if (existsSync('scripts/sync-scores-to-elasticsearch.ts')) {
	console.log('📌 Using existing sync script...\n');
	runCommand('npx', ['tsx', 'scripts/sync-scores-to-elasticsearch.ts', 'sync'])
		.then(() => console.log('\n✅ Done!'))
		.catch((err) => {
			console.error('❌ Sync failed, trying alternative method...\n');
			main();
		});
} else {
	main();
}
