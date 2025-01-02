import { PostgresDialect } from 'kysely';

import { Database } from '@lyku/db-config/kysely';
import { Kysely } from 'kysely';
import { Pool } from 'pg';

const dialect = new PostgresDialect({
	pool: new Pool({
		database: 'Lyku',
		host: 'localhost',
		user: 'admin',
		port: 5434,
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
