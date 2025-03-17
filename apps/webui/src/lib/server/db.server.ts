// This is a server-only module and should never be imported in client code
// SvelteKit will automatically prevent this from being bundled with client code
// The .server.ts extension ensures this file is only used on the server

import { PostgresDialect } from 'kysely';
import type { Database } from '@lyku/db-config/kysely';
import { Kysely } from 'kysely';
import * as Drizzy from '@neondatabase/serverless';
import { DATABASE_URL } from '$env/static/private';

// Set the PostgreSQL type parser for INT8 (BIGINT) to return BigInt objects
// This ensures bigint values are returned as actual BigInt objects, not strings
Drizzy.types.setTypeParser(Drizzy.types.builtins.INT8, function (val) {
	return BigInt(val);
});

/**
 * Initialize the database with a connection string
 * This should only be called once at application startup
 */
export function initDb(connectionString: string): Kysely<Database> {
	console.log('Initializing database connection', connectionString);
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
	return new Kysely<Database>({
		dialect,
		log: ['query', 'error'],
	});
}

export const neon = () =>
	initDb(DATABASE_URL || process?.env?.DATABASE_URL || '');

/**
 * Test the database connection
 */
export async function testConnection(
	connectionString: string,
): Promise<boolean> {
	if (!connectionString) {
		throw new Error('Connection string not passed.');
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
