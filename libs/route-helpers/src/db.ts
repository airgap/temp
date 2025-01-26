import { PostgresDialect } from 'kysely';

import { Database } from '@lyku/db-config/kysely';
import { Kysely } from 'kysely';
import { Pool } from 'pg';
import { dbConnectionString } from './env';

const dialect = new PostgresDialect({
	pool: new Pool({
		connectionString: dbConnectionString,
		max: 10,
	}),
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
	dialect,
});
