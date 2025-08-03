#!/usr/bin/env tsx

import { Pool } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Script to apply optimized indexes for leaderboard queries
 * Run this after initial database setup or when upgrading existing databases
 */

async function createConnection() {
	const { PG_CONNECTION_STRING } = process.env;
	if (!PG_CONNECTION_STRING) {
		throw new Error('PG_CONNECTION_STRING environment variable not set!');
	}

	const pool = new Pool({
		connectionString: PG_CONNECTION_STRING,
		max: 1,
		idleTimeoutMillis: 10000,
		ssl: {
			rejectUnauthorized: true,
		},
	});

	return pool;
}

async function applyLeaderboardOptimizations() {
	console.log('🚀 Starting leaderboard optimization...');

	const pool = await createConnection();
	let client;

	try {
		client = await pool.connect();

		// Read the SQL file with optimized indexes
		const sqlPath = join(
			__dirname,
			'../libs/db-config/src/leaderboard-indexes.sql',
		);
		const optimizationSQL = readFileSync(sqlPath, 'utf8');

		console.log('📖 Loaded optimization SQL from', sqlPath);

		// Split the SQL into individual statements (excluding comments and analysis queries)
		const statements = optimizationSQL
			.split(';')
			.map((stmt) => stmt.trim())
			.filter(
				(stmt) =>
					stmt.length > 0 &&
					!stmt.startsWith('--') &&
					!stmt.startsWith('/*') &&
					!stmt.startsWith('SELECT') && // Skip the verification queries
					!stmt.includes('pg_indexes') &&
					!stmt.includes('pg_stat_user_indexes'),
			);

		console.log(
			`📊 Found ${statements.length} optimization statements to execute`,
		);

		// Execute each statement
		for (let i = 0; i < statements.length; i++) {
			const statement = statements[i];
			if (!statement.trim()) continue;

			console.log(`⚡ Executing optimization ${i + 1}/${statements.length}...`);

			const startTime = Date.now();
			await client.query(statement);
			const duration = Date.now() - startTime;

			console.log(`✅ Completed in ${duration}ms`);
		}

		// Run ANALYZE to update query planner statistics
		console.log('📈 Updating query planner statistics...');
		await client.query('ANALYZE "scores"');

		// Verify indexes were created
		console.log('🔍 Verifying created indexes...');
		const indexes = await client.query(`
            SELECT 
                indexname,
                indexdef
            FROM pg_indexes 
            WHERE tablename = 'scores' 
            AND indexname LIKE '%leaderboard_user%'
            ORDER BY indexname
        `);

		console.log('✨ Successfully created leaderboard optimization indexes:');
		indexes.rows.forEach((row: any) => {
			console.log(`  - ${row.indexname}`);
		});

		console.log('🎉 Leaderboard optimization completed successfully!');
		console.log('');
		console.log('💡 Performance tips:');
		console.log(
			'  - These indexes will significantly speed up leaderboard queries',
		);
		console.log('  - Cache results using Redis for even better performance');
		console.log(
			'  - Monitor slow query logs to identify additional optimizations',
		);
	} catch (error) {
		console.error('❌ Error applying leaderboard optimizations:', error);
		throw error;
	} finally {
		if (client) {
			client.release();
		}
		await pool.end();
	}
}

async function checkCurrentIndexes() {
	console.log('🔍 Current leaderboard-related indexes:');

	const pool = await createConnection();
	let client;

	try {
		client = await pool.connect();

		const indexes = await client.query(`
            SELECT 
                indexname,
                indexdef
            FROM pg_indexes 
            WHERE tablename = 'scores'
            ORDER BY indexname
        `);

		if (indexes.rows.length === 0) {
			console.log('  ⚠️  No indexes found on scores table');
		} else {
			indexes.rows.forEach((row: any) => {
				const isOptimized = row.indexname.includes('leaderboard_user');
				const prefix = isOptimized ? '  ✅' : '  📋';
				console.log(`${prefix} ${row.indexname}`);
			});
		}
		console.log('');
	} catch (error) {
		console.error('❌ Error checking indexes:', error);
		throw error;
	} finally {
		if (client) {
			client.release();
		}
		await pool.end();
	}
}

// Main execution
async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	try {
		switch (command) {
			case 'check':
				await checkCurrentIndexes();
				break;

			case 'apply':
			case undefined:
				await checkCurrentIndexes();
				await applyLeaderboardOptimizations();
				break;

			default:
				console.log('Usage:');
				console.log(
					'  tsx scripts/optimize-leaderboards.ts          # Apply optimizations',
				);
				console.log(
					'  tsx scripts/optimize-leaderboards.ts apply    # Apply optimizations',
				);
				console.log(
					'  tsx scripts/optimize-leaderboards.ts check    # Check current indexes',
				);
				process.exit(1);
		}

		process.exit(0);
	} catch (error) {
		console.error('💥 Script failed:', error);
		process.exit(1);
	}
}

// Execute immediately since this is a script
main();
