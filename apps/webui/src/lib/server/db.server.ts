// This is a server-only module and should never be imported in client code
// SvelteKit will automatically prevent this from being bundled with client code
// The .server.ts extension ensures this file is only used on the server

import { PostgresDialect } from 'kysely';
import type { Database } from '@lyku/db-config/kysely';
import { Kysely } from 'kysely';
import * as Drizzy from '@neondatabase/serverless';

// Singleton pattern for database connection
let db: Kysely<Database> | null = null;
let connectionString: string | null = null;

/**
 * Initialize the database with a connection string
 * This should only be called once at application startup
 */
export function initDb(pgConnectionString: string): Kysely<Database> {
	if (db) {
		console.log('Database already initialized, returning existing instance');
		return db;
	}

	console.log('Initializing database connection', pgConnectionString);
	connectionString = pgConnectionString;

	const dialect = new PostgresDialect({
		pool: new Drizzy.Pool({
			connectionString,
			max: 10,
			idleTimeoutMillis: 10000,
			query_timeout: 5000,
			ssl: {
				rejectUnauthorized: true,
			},
		}),
	});

	db = new Kysely<Database>({
		dialect,
		log: ['query', 'error'],
	});

	return db;
}

/**
 * Get the database instance, initializing it if necessary
 */
export function getDb(pgConnectionString?: string): Kysely<Database> {
	if (db) {
		return db;
	}

	if (!pgConnectionString) {
		throw new Error(
			'Database not initialized and no connection string provided'
		);
	}

	return initDb(pgConnectionString);
}

/**
 * Test the database connection
 */
export async function testConnection(): Promise<boolean> {
	if (!connectionString) {
		throw new Error('Connection string not set. Call initDb first.');
	}

	const pool = new Drizzy.Pool({
		connectionString,
		max: 1,
		idleTimeoutMillis: 20000,
		connectionTimeoutMillis: 5000,
		ssl: {
			rejectUnauthorized: true,
		},
	});

	let client;
	try {
		client = await pool.connect();
		const res = await client.query('SELECT NOW()');
		console.log('PostgreSQL connection successful:', res.rows[0]);
		return true;
	} catch (error) {
		console.error('Error connecting to PostgreSQL:', error);
		return false;
	} finally {
		if (client) {
			client.release();
		}
		await pool.end();
	}
}
