// This is a server-only module and should never be imported in client code
// SvelteKit will automatically prevent this from being bundled with client code
// The .server.ts extension ensures this file is only used on the server

import { PostgresDialect } from 'kysely';
import type { Database } from '@lyku/db-types';
import { Kysely } from 'kysely';
import { PG_CONNECTION_STRING } from '$env/static/private';

import { Pool, types } from '@neondatabase/serverless';

types.setTypeParser(types.builtins.INT8, (val) =>
	val === null ? null : BigInt(val),
);

types.setTypeParser(1016, (val: string | null) =>
	val === null || val === '{}'
		? []
		: val
				.slice(1, -1) // Remove surrounding braces
				.split(',')
				.map((v) => BigInt(v.trim())),
);

export const initDialect = (connectionString: string) =>
	new PostgresDialect({
		pool: new Pool({
			connectionString,
			max: 10,
			idleTimeoutMillis: 10000,
			query_timeout: 5000,
			ssl: {
				rejectUnauthorized: true,
			},
		}),
	});
/**
 * Initialize the database with a connection string
 * This should only be called once at application startup
 */
export const initDb = (connectionString: string): Kysely<Database> =>
	new Kysely<Database>({
		dialect: initDialect(connectionString),
		log: ['query', 'error'],
	});
console.log('PG_CONNECTION_STRING', PG_CONNECTION_STRING);
export const neon = () =>
	initDb(PG_CONNECTION_STRING || process?.env?.PG_CONNECTION_STRING || '');

/**
 * Test the database connection
 */
export async function testConnection(
	connectionString: string,
): Promise<boolean> {
	if (!connectionString) {
		throw new Error('Connection string not passed.');
	}

	const pool = new Pool({
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
