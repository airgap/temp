import { PostgresDialect } from 'kysely';

import type { Database } from '@lyku/db-config/kysely';
import { Kysely } from 'kysely';
import { Pool } from 'pg';
import { dbConnectionString } from './env';
import { readFileSync } from 'fs';
const ca = readFileSync('./k8s-prd-ca-cert.crt', 'utf8');

async function testConnection() {
	const pool = new Pool({
		connectionString: dbConnectionString,
		max: 10,
		idleTimeoutMillis: 20000,
		connectionTimeoutMillis: 5000, // Increased timeout for establishing a connection
		ssl: {
			ca,
			rejectUnauthorized: true,
		},
	});

	const client = await pool.connect();
	try {
		const res = await client.query('SELECT NOW()'); // Basic query to check connection
		console.log('PostgreSQL connection successful:', res.rows[0]);
	} catch (error) {
		console.error('Error connecting to PostgreSQL:', error);
	} finally {
		client.release();
	}
}

// Call the test connection function
// testConnection().catch((error) => {
// 	console.error('Connection test failed:', error);
// });

const dialect = new PostgresDialect({
	pool: new Pool({
		connectionString: dbConnectionString,
		max: 10,
		idleTimeoutMillis: 10000,
		query_timeout: 5000,
		ssl: {
			ca,
			rejectUnauthorized: true,
		},
	}),
});
console.log('dbConnectionString', dbConnectionString);

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
	dialect,
	log: ['query', 'error'],
});
