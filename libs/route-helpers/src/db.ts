import { PostgresDialect } from 'kysely';

import type { Database } from '@lyku/db-types';
import { Kysely } from 'kysely';
import { Pool, PoolConfig, types } from 'pg';
import { dbConnectionString } from './env';
import { readFileSync } from 'fs';
const ca = readFileSync('./k8s-prd-ca-cert.crt');

const pgOpts = {
	connectionString: dbConnectionString,
	max: 10,
	idleTimeoutMillis: 20000,
	connectionTimeoutMillis: 5000, // Increased timeout for establishing a connection
	ssl: {
		ca,
		rejectUnauthorized: false,
	},
} satisfies PoolConfig;

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

async function testConnection() {
	const pool = new Pool(pgOpts);

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
testConnection().catch((error) => {
	console.error('Connection test failed:', error);
});

const dialect = new PostgresDialect({
	pool: new Pool(pgOpts),
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
