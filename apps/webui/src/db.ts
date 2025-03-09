/**
 * @deprecated This file is deprecated. Use the server-only module instead.
 * Import from '$lib/server/db' in server-only code.
 */

// This file should only be imported in server-side code
if (typeof window !== 'undefined') {
	throw new Error('This module can only be imported in server-side code');
}

// Throw an error to prevent this file from being used
throw new Error(
	'This database module is deprecated. Please use the server-only module instead. ' +
		'Import from "$lib/server/db" in server-only code.'
);

// The rest of this file is kept for reference but will never be executed
/* 
import { PostgresDialect } from 'kysely';
import type { Database } from '@lyku/db-config/kysely';
import { Kysely } from 'kysely';
import * as Drizzy from '@neondatabase/serverless';

let connectionString: string;

export function initDb(pgConnectionString: string) {
	console.log('Initializing DB with', pgConnectionString);
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
	return new Kysely<Database>({
		dialect,
		log: ['query', 'error'],
	});
}

async function testConnection() {
	const pool = new Drizzy.Pool({
		connectionString,
		max: 10,
		idleTimeoutMillis: 20000,
		connectionTimeoutMillis: 5000,
		ssl: {
			rejectUnauthorized: true,
		},
	});

	const client = await pool.connect();
	try {
		const res = await client.query('SELECT NOW()');
		console.log('PostgreSQL connection successful:', res.rows[0]);
	} catch (error) {
		console.error('Error connecting to PostgreSQL:', error);
	} finally {
		client.release();
	}
}
*/
